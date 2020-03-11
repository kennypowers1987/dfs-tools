import React, { useState, useEffect } from "react";
import { CSVReader, jsonToCSV } from "react-papaparse";
import { Table } from "./ImportTable";
import { Form, Col } from "react-bootstrap";

const ProjectionNormalizer = () => {
  const rgInput = React.createRef();
  const ssInput = React.createRef();
  const SDInput = React.createRef();
  const [rgData, setRgData] = useState([]);
  const [ssData, setSsData] = useState([]);
  const [SDData, setSDData] = useState([]);
  const [exportData, setExportData] = useState({});
  const rgWeightInput = React.createRef();
  const ssWeightInput = React.createRef();
  const SDWeightInput = React.createRef();

  const isNumeric = num => {
    return !isNaN(num);
  };

  const fuzzyMatch = (str, pattern) => {
    pattern = pattern.split("").reduce(function(a, b) {
      return a + ".*" + b;
    });
    return new RegExp(pattern).test(str);
  };

  useEffect(() => {
    if (!ssData.length || Object.keys(rgData[5]).includes("In Play")) {
      return;
    }
    console.log("running");
    let finalPlayer;
    const comparison = rgData.map(player => {
      //let saberSimPlayer = ssData.find(({ Name }) => Name === player.Player);
      let saberSimPlayer = ssData.find(({ Name }) =>
        fuzzyMatch(Name, player.Player)
      );
      if (saberSimPlayer) {
        player["SS Projection"] =
          saberSimPlayer["SS Projection"] > 0
            ? saberSimPlayer["SS Projection"]
            : null;
        player["Overall Projection"] =
          (saberSimPlayer["SS Projection"] + player.Points) / 2;
      } else {
        player["SS Projection"] = null;
        player["Overall Projection"] = player.Points;
      }
      player["pOWN%"] = player["pOWN%"] ? player["pOWN%"] : null;
      player.ppD = (player["Overall Projection"] / player.Salary) * 1000;
      if (player["pOWN%"] > 0) {
        player["In Play"] =
          player["Overall Projection"] > 15 && player.ppD > 2.5 ? true : false;
        player["Leverage Rating"] = player["In Play"]
          ? player.ppD / (1 / player["pOWN%"] / 10) / player["pOWN%"]
          : -1;
        const ceilingPpd = (player["Ceil"] / player.Salary) * 1000;
        player["Leverage Rating"] =
          player["Leverage Rating"] * 10 + (ceilingPpd - player.ppD);
      } else {
        player["In Play"] = false;
        player["Leverage Rating"] = -1;
      }

      finalPlayer = Object.assign({}, saberSimPlayer, player);
      return finalPlayer;
    });

    setRgData(comparison);

    const exports = {};
    exports.rg = comparison.map(player => {
      let exportRow = {};
      exportRow.name = player.Player;
      exportRow.fpts = player["Overall Projection"]
        ? player["Overall Projection"]
        : null;
      return exportRow;
    });

    exports.ss = comparison.map(player => {
      let exportRow = {};
      exportRow.Name = player.Player;
      exportRow.Projection = player["Overall Projection"]
        ? player["Overall Projection"]
        : null;
      exportRow.Ownership = player["pOWN%"] ? player["pOWN%"] : null;
      return exportRow;
    });
    setExportData(exports);
  }, [
    rgData,
    setRgData,
    ssData,
    setSsData,
    SDData,
    setSDData,
    exportData,
    setExportData
  ]);

  const handleReadRgCSV = data => {
    const parsedData = [];
    data.data.forEach(obj => {
      if (Object.values(obj).length > 1) {
        const newObj = {};
        const keys = Object.keys(obj);
        Object.values(obj).forEach((v, index) => {
          let newVal;
          if (isNumeric(v) || v.includes("%")) {
            newVal = parseFloat(v);
          } else {
            newVal = v;
          }
          newObj[keys[index]] = newVal;
        });
        parsedData.push(newObj);
      }
    });
    setRgData(parsedData);
  };

  const handleReadSsCSV = data => {
    const parsedData = [];
    data.data.forEach(obj => {
      if (Object.values(obj).length > 1) {
        const newObj = {};
        const keys = Object.keys(obj);
        Object.values(obj).forEach((v, index) => {
          let newVal;
          if (isNumeric(v)) {
            newVal = parseFloat(v);
          } else {
            newVal = v;
          }
          newObj[keys[index]] = newVal;
        });
        parsedData.push(newObj);
      }
    });
    setSsData(parsedData);
  };

  const handleReadSDCSV = data => {
    const parsedData = [];
    data.data.forEach(obj => {
      if (Object.values(obj).length > 1) {
        const newObj = {};
        const keys = Object.keys(obj);
        Object.values(obj).forEach((v, index) => {
          let newVal;
          if (isNumeric(v)) {
            newVal = parseFloat(v);
          } else {
            newVal = v;
          }
          newObj[keys[index]] = newVal;
        });
        parsedData.push(newObj);
      }
    });
    setSDData(parsedData);
    let finalPlayer;
    const comparison = rgData.map(player => {
      //let SDPlayer = parsedData.find(({ PLAYER }) => PLAYER === player.Player);
      let SDPlayer = parsedData.find(({ Name }) =>
        fuzzyMatch(Name, player.Player)
      );
      if (SDPlayer && player["Overall Projection"]) {
        SDPlayer["SuperDraft Projection"] =
          player["Overall Projection"] * SDPlayer.Multiplier;
      }
      finalPlayer = Object.assign({}, SDPlayer, player);
      return finalPlayer;
    });
    const exports = {};
    exports.rg = comparison.map(player => {
      let exportRow = {};
      exportRow.name = player.Player;
      exportRow.fpts = player["COMBINED PROJECTION"]
        ? player["COMBINED PROJECTION"]
        : null;
      return exportRow;
    });

    exports.ss = comparison.map(player => {
      let exportRow = {};
      exportRow.Name = player.Player;
      exportRow.Projection = player["COMBINED PROJECTION"]
        ? player["COMBINED PROJECTION"]
        : null;
      exportRow.Ownership = player["pOWN%"] ? player["pOWN%"] : null;
      return exportRow;
    });
    exports.sd = comparison.map(player => {
      if (player) {
        return player;
      }
    });
    setExportData(exports);
    setRgData(comparison);
  };

  const handleWeightChange = () => {
    const rg = rgWeightInput.current.valueAsNumber;
    const ss = ssWeightInput.current.valueAsNumber;
    const SD = SDWeightInput.current.valueAsNumber;
    if (!rg || !ss || !SD) return;
    if (rg + ss + SD !== 100) return;
    const normalization = rgData.map(player => {
      let finalPlayer = {};
      const projectionSum =
        player["SS Projection"] * ss + player.Points * rg + player.FPTS * SD;
      const projectionDivider = rg + ss + SD;
      const combinedProjection = projectionSum / projectionDivider;
      finalPlayer["COMBINED PROJECTION"] = parseFloat(
        combinedProjection.toFixed(1)
      )
        ? parseFloat(combinedProjection.toFixed(1))
        : 0;
      finalPlayer["COMBINED VALUE"] =
        player["COMBINED PROJECTION"] / player.SAL
          ? parseFloat(player["COMBINED PROJECTION"] / player.SAL).toFixed(2)
          : 0;
      finalPlayer = Object.assign({}, player, finalPlayer);
      return finalPlayer;
    });

    const exports = {};
    exports.rg = normalization.map(player => {
      if (player) {
        let exportRow = {};
        exportRow.name = player.Player;
        exportRow.fpts = player["COMBINED PROJECTION"]
          ? player["COMBINED PROJECTION"]
          : null;
        return exportRow;
      }
    });

    exports.ss = normalization.map(player => {
      if (player) {
        let exportRow = {};
        exportRow.Name = player.Player;
        exportRow.Projection = player["COMBINED PROJECTION"]
          ? player["COMBINED PROJECTION"]
          : null;
        exportRow.Ownership = player["pOWN%"] ? player["pOWN%"] : null;
        return exportRow;
      }
    });

    exports.sd = normalization.map(player => {
      if (player) {
        return player;
      }
    });
    setRgData(normalization);
    setExportData(exports);
  };

  const exportToCsv = site => {
    const config = {
      columns:
        site === "rg"
          ? ["name", "fpts"]
          : site === "ss"
          ? ["Name", "Projection", "Ownership"]
          : ["Lineup Position", "ID+Name", "SuperDraft Projection"],
      download: true,
      skipEmptyLines: true
    };
    if (site === "sd") {
      return generateSuperDraftLineupsAndExport();
    }
    if (exportData && exportData[site]) {
      const csv = jsonToCSV(exportData[site], config);
      var hiddenElement = document.createElement("a");
      hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
      hiddenElement.target = "_blank";
      hiddenElement.download = `${site}.csv`;
      hiddenElement.click();
    }
  };

  const generateSuperDraftLineupsAndExport = () => {
    const players = exportData["sd"]
      .filter(player => {
        if (player["SuperDraft Projection"]) {
          return player;
        }
      })
      .sort((a, b) =>
        a["SuperDraft Projection"] < b["SuperDraft Projection"] ? 1 : -1
      );
    const numberOfGamesOnSlate =
      new Set(
        exportData["sd"].map(player => {
          if (player["Game"]) {
            return player["Game"];
          }
        })
      ).size - 1;
    let playerPool = {};
    if (numberOfGamesOnSlate < 4) {
      return alert("Just play the opto");
    } else {
      const howManyGuardsAndForwards = numberOfGamesOnSlate < 6 ? 4 : 6;
      const howManyCenters = numberOfGamesOnSlate < 6 ? 2 : 3;
      playerPool.guards = players
        .filter(player => player["Lineup Position"] === "G")
        .slice(0, howManyGuardsAndForwards);
      playerPool.forwards = players
        .filter(player => player["Lineup Position"] === "F")
        .slice(0, howManyGuardsAndForwards);
      playerPool.centers = players
        .filter(player => player["Lineup Position"] === "C")
        .slice(0, howManyCenters);
    }

    generateForSuperDraft(playerPool);
  };

  const generateForSuperDraft = originalPlayers => {
    let lineups = [];
    let players = originalPlayers;
    const generate = () => {
      if (lineups.length < 151) {
        const getPlayer = (position, lineup) => {
          const playerIndex = Math.floor(
            Math.random() * players[position].length
          );

          const player = players[position][playerIndex]['ID+Name'];
          console.log(Object.values(lineup), player)
          if (!Object.values(lineup).includes(player)) {
            return player;
          } else {
            return getPlayer(position, lineup);
          }
        };

        let lineup = {};
        lineup.G1 = getPlayer("guards", lineup);
        lineup.G2 = getPlayer("guards", lineup);
        lineup.G3 = getPlayer("guards", lineup);
        lineup.F1 = getPlayer("forwards", lineup);
        lineup.F2 = getPlayer("forwards", lineup);
        lineup.F3 = getPlayer("forwards", lineup);
        lineup.C = getPlayer("centers", lineup);

        lineups.push(lineup);

        return window.setTimeout(generate(), 1);
      } else {
        console.warn("process complete", lineups);
        lineups[0] = {
          G1: players['guards'][0]['ID+Name'],
          G2: players['guards'][1]['ID+Name'],
          G3: players['guards'][2]['ID+Name'],
          F1: players['forwards'][0]['ID+Name'],
          F2: players['forwards'][1]['ID+Name'],
          F3: players['forwards'][2]['ID+Name'],
          C: players['centers'][0]['ID+Name']
        }
        const config = {
          columns:['G1', 'G2','G3','F1','F2','F3','C'],
          download: true,
          skipEmptyLines: true
        };
       
          const csv = jsonToCSV(lineups, config);
          var hiddenElement = document.createElement("a");
          hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
          hiddenElement.target = "_blank";
          hiddenElement.download = 'SD.csv';
          hiddenElement.click();
        
      }
    };
    generate();
  };

  const tableConfig = {
    header: true
  };

  return (
    <div className="container-fluid lead">
      <div className="jumbotron jumbotron-fluid">
        <div style={{ "margin-left": ".5em" }}>
          <h2>Projection Normalizer</h2>
          <h3>Getting Started</h3>
          <div>
            <ol>
              <li>
                Import projections from RotoGrinders (subscription required)
                <CSVReader
                  onFileLoaded={handleReadRgCSV}
                  configOptions={tableConfig}
                  inputRef={rgInput}
                />
              </li>
              <li>
                Import projections from SaberSim (subscription required)
                <CSVReader
                  onFileLoaded={handleReadSsCSV}
                  configOptions={tableConfig}
                  inputRef={ssInput}
                />
              </li>
              <li>
                Convert projections for SuperDraft (subscription required)
                <CSVReader
                  onFileLoaded={handleReadSDCSV}
                  configOptions={tableConfig}
                  inputRef={SDInput}
                />
              </li>
            </ol>
            <Form id="normalizationForm" style={{ margin: ".5em" }}>
              <Form.Row>
                <Col>
                  <Form.Label>RG Weight</Form.Label>
                  <Form.Control
                    placeholder="RG Weight"
                    name="rgWeight"
                    type="number"
                    required
                    onChange={handleWeightChange}
                    ref={rgWeightInput}
                  />
                </Col>
                <Col>
                  <Form.Label>SS Weight</Form.Label>
                  <Form.Control
                    placeholder="SS Weight"
                    name="ssWeight"
                    type="number"
                    required
                    onChange={handleWeightChange}
                    ref={ssWeightInput}
                  />
                </Col>
                <Col>
                  <Form.Label>SD Weight</Form.Label>
                  <Form.Control
                    placeholder="SD Weight"
                    name="SDWeight"
                    type="number"
                    required
                    onChange={handleWeightChange}
                    ref={SDWeightInput}
                  />
                </Col>
              </Form.Row>
            </Form>
          </div>
          <button
            className="btn btn-info float-right"
            onClick={() => {
              exportToCsv("rg");
            }}
          >
            Export projections for RotoGrinders
          </button>
          <button
            className="btn btn-info float-right"
            onClick={() => {
              exportToCsv("ss");
            }}
          >
            Export projections for SaberSim
          </button>
          <button
            className="btn btn-info float-right"
            onClick={() => {
              exportToCsv("sd");
            }}
          >
            Export projections for SuperDraft
          </button>
        </div>
      </div>
      {rgData && rgData.length ? (
        <div style={{ display: "flex" }}>
          <div style={{ flex: "50%", overflow: "auto" }}>
            {rgData.length ? (
              <Table
                tableData={rgData.filter(row => {
                  if (row) {
                    return row;
                  }
                })}
                tableTitle="Projections"
              ></Table>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProjectionNormalizer;
