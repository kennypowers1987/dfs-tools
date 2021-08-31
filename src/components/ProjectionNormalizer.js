import React, { useState, useEffect } from "react";
import { CSVReader, jsonToCSV } from "react-papaparse";
import { Table } from "./ImportTable";
import { Form, Col } from "react-bootstrap";

const ProjectionNormalizer = () => {
  const rgInput = React.createRef();
  const fdInput = React.createRef();
  const [rgData, setRgData] = useState([]);
  const [fdData, setFdData] = useState([]);
  const [exportData, setExportData] = useState({});
  const rgWeightInput = React.createRef();
  const fdWeightInput = React.createRef();


  const isNumeric = (num) => {
    return !isNaN(num);
  };

  const fuzzyMatch = (str, pattern) => {
    pattern = pattern.split("").reduce(function (a, b) {
      return a + ".*" + b;
    });
    return new RegExp(pattern).test(str);
  };

  useEffect(() => {
    if (!fdData.length || Object.keys(rgData[5]).includes("In Play")) {
      return;
    }
    if(exportData.rg && exportData.rg.length && exportData.fd && exportData.fd.length) {
      return;
    }
    let finalPlayer;
    const comparison = rgData.map((player) => {
      let fantasyDataPlayer = fdData.find(({ Name }) =>{
        return fuzzyMatch(Name, player.name)
      }
       
      );
      if (fantasyDataPlayer) {
        player["FantasyPointsDraftKings"] =
          fantasyDataPlayer["FantasyPointsDraftKings"] > 0
            ? fantasyDataPlayer["FantasyPointsDraftKings"]
            : null;
        player["Overall Projection"] =
          (fantasyDataPlayer["FantasyPointsDraftKings"] + player.fpts) / 2;
      } else {
        player["FantasyPointsDraftKings"] = null;
        player["Overall Projection"] = player.Points;
      }
      finalPlayer = Object.assign({}, fantasyDataPlayer, player);
      return finalPlayer;
    });

    setRgData(comparison);

    const exports = {};
    exports.rg = comparison.map((player) => {
      let exportRow = {};
      exportRow.player_id = player.player_id;
      exportRow.fpts = player["Overall Projection"]
        ? player["Overall Projection"]
        : null;
      return exportRow;
    });

    exports.fd = comparison.map((player) => {
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
    fdData,
    setFdData,
    exportData,
    setExportData,
  ]);

  const handleReadRgCSV = (data) => {
    const parsedData = [];
    data.data.forEach((obj) => {
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

  const handleReadFdCSV = (data) => {
    const parsedData = [];
    data.data.forEach((obj) => {
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
    setFdData(parsedData);
  };

  const handleWeightChange = () => {    
    const rg = rgWeightInput.current.valueAsNumber;
    const fd = fdWeightInput.current.valueAsNumber;
    if (!rg || !fd) return;
    if (rg + fd !== 100) return;
    const normalization = rgData.map((player) => {
      let finalPlayer = {};
      if(!player["FantasyPointsDraftKings"]){
        player["FantasyPointsDraftKings"] = player.fpts;
      }
      const projectionSum =
        (player["FantasyPointsDraftKings"] * fd) + (player.fpts * rg)
      const projectionDivider = rg + fd;
      const combinedProjection = projectionSum / projectionDivider;
      finalPlayer["COMBINED PROJECTION"] = parseFloat(
        combinedProjection.toFixed(1)
      )
        ? parseFloat(combinedProjection.toFixed(1))
        : 0;
      finalPlayer = Object.assign({}, player, finalPlayer);
      return finalPlayer;
    });

    const exports = {};
    exports.rg = normalization.map((player) => {
      if (player) {
        console.log(player)
        let exportRow = {};
        exportRow.player_id = player.player_id;
        exportRow.fpts = player["COMBINED PROJECTION"]
          ? player["COMBINED PROJECTION"]
          : null;
        return exportRow;
      }
    });

    exports.fd = normalization.map((player) => {
      if (player) {        
        let exportRow = {};
        exportRow.Name = player.name;
        exportRow.Projection = player["COMBINED PROJECTION"]
          ? player["COMBINED PROJECTION"]
          : null;
        exportRow.Ownership = player["pOWN%"] ? player["pOWN%"] : null;
        return exportRow;
      }
    });   
    setRgData(normalization);
    setExportData(exports);
  };

  const exportToCsv = (site) => {
    const config = {
      columns:
        site === "rg"
          ? ["player_id", "fpts"]
          : site === "fd"
          ? ["Name", "Projection", "Ownership"]
          : ["Lineup Position", "ID+Name", "SuperDraft Projection"],
      download: true,
      skipEmptyLines: true,
    };    
    if (exportData && exportData[site]) {
      const csv = jsonToCSV(exportData[site], config);
      var hiddenElement = document.createElement("a");
      hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
      hiddenElement.target = "_blank";
      hiddenElement.download = `${site}.csv`;
      hiddenElement.click();
    }
  };

  const tableConfig = {
    header: true,
  };

  return (
    <div className="container-fluid lead">
      <div className="jumbotron jumbotron-fluid">
        <div style={{ "marginLeft": ".5em" }}>
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
                Import projections from FantasyData (subscription required)
                <CSVReader
                  onFileLoaded={handleReadFdCSV}
                  configOptions={tableConfig}
                  inputRef={fdInput}
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
                  <Form.Label>FantasyData Weight</Form.Label>
                  <Form.Control
                    placeholder="FantasyData Weight"
                    name="fdWeight"
                    type="number"
                    required
                    onChange={handleWeightChange}
                    ref={fdWeightInput}
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
        </div>
      </div>
      {rgData && rgData.length ? (
        <div style={{ display: "flex" }}>
          <div style={{ flex: "50%", overflow: "auto" }}>
            {rgData.length ? (
              <Table
                tableData={rgData.filter((row) => {
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
