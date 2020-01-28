import React, { useState } from "react";
import { CSVReader } from "react-papaparse";
import { Table } from "./ImportTable";

const ProjectionNormalizer = () => {
  const rgInput = React.createRef();
  const ssInput = React.createRef();
  const [rgData, setRgData] = useState([]);
  const [ssData, setSsData] = useState([]);

  const handleReadRgCSV = data => {
    setRgData(data.data);
    console.log(rgData);
  };
  const handleReadSsCSV = data => {
    setSsData(data.data);
    console.log(ssData);
  };

  const tableConfig = {
    header: true
  };

  return (
    <div className="container">
      <h1>Projection Normalizer</h1>
      <h2>Getting Started</h2>
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
      <div style={{display: 'flex'}}>
        <div style={{flex: '50%', overflow: 'auto'}}>
          {rgData.length ? (
            // create reusable Table component
            <Table
              tableData={rgData}
              tableTitle="RotoGrinders Projections"
            ></Table>
          ) : null}
        </div>
        <div style={{flex: '50%', overflow: 'auto'}}>
          {ssData.length ? (
            // create reusable Table component
            <Table tableData={ssData} tableTitle="SaberSim Projections"></Table>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProjectionNormalizer;
