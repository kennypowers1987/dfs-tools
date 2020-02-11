import React, { useState, useEffect } from "react";
import { CSVReader, jsonToCSV } from "react-papaparse";
import { Table } from "./ImportTable";

const ProjectionNormalizer = () => {
  const rgInput = React.createRef();
  const ssInput = React.createRef();
  const [rgData, setRgData] = useState([]);
  const [ssData, setSsData] = useState([]);
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
  }, [rgData, setRgData, ssData, setSsData, exportData, setExportData]);

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
          </ol>
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
