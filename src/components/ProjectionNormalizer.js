import React, { useState, useEffect } from "react";
import { CSVReader, jsonToCSV } from "react-papaparse";
import { Table } from "./ImportTable";

const ProjectionNormalizer = () => {
  const rgInput = React.createRef();
  const ssInput = React.createRef();
  const [rgData, setRgData] = useState([]);
  const [ssData, setSsData] = useState([]);
  const [exportData, setExportData] = useState({});

  const handleReadRgCSV = data => {
    setRgData(data.data);
  };

  const handleReadSsCSV = data => {
    setSsData(data.data);
  };

  const exportToCsv = site => {
    const config = {
      columns:
        site === "rg" ? ["name", "fpts"] : ["Name", "Projection", "Ownership"],
      download: true,
      skipEmptyLines: true
    };
    if (exportData && exportData[site]) {
      console.log(exportData[site]);
      console.log(jsonToCSV(exportData[site], config), config);
      const csv = jsonToCSV(exportData[site], config);
      var hiddenElement = document.createElement("a");
      hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
      hiddenElement.target = "_blank";
      hiddenElement.download = `${site}.csv`;
      hiddenElement.click();
    }
  };

  useEffect(() => {
    if (!ssData.length || rgData[0].ssProjection) {
      return;
    }
    const comparison = rgData.map(player => {
      let saberSimPlayer = ssData.find(({ Name }) => Name === player.Player);
      if (saberSimPlayer) {
        player.ssProjection = saberSimPlayer.Projection;
        player.overallProjection =
          (parseFloat(saberSimPlayer.Projection) + parseFloat(player.Points)) /
          2;
      } else {
        player.ssProjection = null;
        player.overallProjection = player.Points;
      }
      return player;
    });
    setRgData(comparison);

    const exports = {};
    exports.rg = comparison.map(player => {
      let exportRow = {};
      exportRow.name = player.Player;
      exportRow.fpts = player.overallProjection
        ? player.overallProjection
        : null;
      return exportRow;
    });

    exports.ss = comparison.map(player => {
      let exportRow = {};
      exportRow.Name = player.Player;
      exportRow.Projection = player.overallProjection
        ? player.overallProjection
        : null;
      exportRow.Ownership = player["pOWN%"] ? player["pOWN%"] : null;
      return exportRow;
    });
    setExportData(exports);
  }, [setRgData, ssData, rgData, setExportData]);

  const tableConfig = {
    header: true
  };

  return (
    <div className="container">
      <h1>Projection Normalizer</h1>
      <h2>Getting Started</h2>
      <div style={{ float: "right", marginRight: "10vw" }}>
        <button
          onClick={() => {
            exportToCsv("rg");
          }}
        >
          Export for Rotogrinders
        </button>
        <button
          onClick={() => {
            exportToCsv("ss");
          }}
        >
          Export for SaberSim
        </button>
      </div>
      <ol>
        <li>
          Import projections from Rotogrinders (subscription required)
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
      <div style={{ display: "flex" }}>
        <div style={{ flex: "50%", overflow: "auto" }}>
          {rgData.length ? (
            // create reusable Table component
            <Table tableData={rgData} tableTitle="Projections"></Table>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProjectionNormalizer;
