import React, { useState, useEffect } from "react";
import { CSVReader, jsonToCSV } from "react-papaparse";
import { Table } from "./ImportTable";
import { Form, Col, Button } from "react-bootstrap";

const ProjectionNormalizer = () => {
  const rgInput = React.createRef();
  const ssInput = React.createRef();
  const rwInput = React.createRef();
  const [rgData, setRgData] = useState([]);
  const [ssData, setSsData] = useState([]);
  const [rwData, setRwData] = useState([]);
  const [exportData, setExportData] = useState({});
  
  const isNumeric = num => {
    return !isNaN(num);
  };

  useEffect(() => {
    if (!ssData.length || Object.keys(rgData[5]).includes("In Play")) {
      return;
    }
    console.log("running");
    let finalPlayer;
    const comparison = rgData.map(player => {
      let saberSimPlayer = ssData.find(({ Name }) => Name === player.Player);
      if (saberSimPlayer) {
        player["SS Projection"] =
          saberSimPlayer.Projection > 0 ? saberSimPlayer.Projection : null;
        player["Overall Projection"] =
          (saberSimPlayer.Projection + player.Points) / 2;
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
        console.log(typeof player["Leverage Rating"]);
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
    rwData,
    setRwData,
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

  const handleReadRwCSV = data => {
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
    setRwData(parsedData);
    let finalPlayer;
    const comparison = rgData.map(player => {
      let rwPlayer = parsedData.find(({ PLAYER }) => PLAYER === player.Player);
      if (rwPlayer && rwPlayer.ACTIONS) {
        delete rwPlayer.ACTIONS;
      }

      if (
        rwPlayer &&
        player["SS Projection"] &&
        player.Points &&
        rwPlayer.FPTS
      ) {
        rwPlayer["RG PROJECTION"] = player.Points;
        rwPlayer["SS PROJECTION"] = player["SS Projection"];
        rwPlayer["COMBINED PROJECTION"] = parseFloat(
          (
            (player["SS Projection"] + player.Points + rwPlayer.FPTS) /
            3
          ).toFixed(3)
        );
        rwPlayer['COMBINED VALUE'] = rwPlayer["COMBINED PROJECTION"] / rwPlayer.SAL
      }
      if (rwPlayer) {
        rwPlayer["pOWN"] = player["pOWN"] ? player["pOWN"] : null;
      }
      finalPlayer = Object.assign({}, rwPlayer, player);
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
    setExportData(exports);
    setRgData(comparison);
  };

  const handleSubmit = (form, values) => {
    console.log(form, values)
  }

  const exportToCsv = site => {
    const config = {
      columns:
        site === "rg" ? ["name", "fpts"] : ["Name", "Projection", "Ownership"],
      download: true,
      skipEmptyLines: true
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
    header: true
  };

  return (
    <div className="container-fluid lead">
      <div className="jumbotron jumbotron-fluid">
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
              Import projections from Rotowire (subscription required)
              <CSVReader
                onFileLoaded={handleReadRwCSV}
                configOptions={tableConfig}
                inputRef={rwInput}
              />
            </li>
          </ol>
          <Form id='normalizationForm'>
            <Form.Row>
              <Col>
                <Form.Control placeholder="RG Weight" id='rgWeight' type='number' required />
              </Col>
              <Col>
                <Form.Control placeholder="SS Weight" id='ssWeight' type='number' required />
              </Col>
              <Col>
                <Form.Control placeholder="RW Weight" id='rwWeight' type='number' required />
              </Col>
              <Button variant="primary" onClick={handleSubmit} className='float-right'>
              Normalize Projections
            </Button>
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
      </div>

      <div style={{ display: "flex" }}>
        <div style={{ flex: "50%", overflow: "auto" }}>
          {rgData.length ? (
            <Table
              tableData={rgData.filter(row => {
                if (row.Player) {
                  return row;
                }
              })}
              tableTitle="Projections"
            ></Table>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProjectionNormalizer;
