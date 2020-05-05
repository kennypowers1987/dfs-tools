import React, { useState } from "react";
import { CSVReader, jsonToCSV } from "react-papaparse";
import { Table } from "./ImportTable";
import { Form, Col } from "react-bootstrap";

const KBOPage = (props) => {
  const awesemoInput = React.createRef();
  const ssInput = React.createRef();
  const rgInput = React.createRef();
  const awesemoWeightInput = React.createRef();
  const ssWeightInput = React.createRef();
  const rgWeightInput = React.createRef();
  const tableConfig = {
    header: true,
  };
  const [awesemoData, setAwesemoData] = useState([{ noData: null }]);
  const [saberSimData, setSaberSimData] = useState([{ noData: null }]);
  const [rgData, setRgData] = useState([{ noData: null }]);
  const [tableData, setTableData] = useState([{ noData: null }]);
  const [exportData, setExportData] = useState({});

  const fuzzyMatch = (str, pattern) => {
    pattern = pattern.split("").reduce(function (a, b) {
      return a + ".*" + b;
    });
    return new RegExp(pattern).test(str);
  };

  const parseTableData = (ssData) => {
    console.log(awesemoData, saberSimData, rgData);
    const combinedData = awesemoData.map((player) => {
      const newPlayer = ssData.find((p) => fuzzyMatch(player.Name, p.Name));
      const finalPlayer = Object.assign(player, newPlayer);
      finalPlayer.Projection = finalPlayer.Projection
        ? parseFloat(finalPlayer.Projection)
        : 0;
      finalPlayer["SS Projection"] = finalPlayer["SS Projection"]
        ? parseFloat(finalPlayer["SS Projection"])
        : 0;
      finalPlayer["My Projection"] =
        ((finalPlayer.Projection > 0
          ? finalPlayer.Projection
          : finalPlayer["SS Projection"]) +
          (finalPlayer["SS Projection"] > 0
            ? finalPlayer["SS Projection"]
            : finalPlayer.Projection)) /
        2;
      return finalPlayer;
    });

    console.log(combinedData);

    setTableData(combinedData);
    const exports = {};
    exports.ss = combinedData.map((player) => {
      let exportRow = {};
      exportRow.Name = player.Name;
      exportRow.Projection = player["My Projection"]
        ? player["My Projection"]
        : null;
      exportRow.Ownership = player["pOWN%"] ? player["pOWN%"] : null;
      return exportRow;
    });
    setExportData(exports);
  };

  const handleReadAwesemoCsv = (awesemoCsvToJson) => {
    setAwesemoData(awesemoCsvToJson.data);
  };
  const handleReadSSCsv = (ssCsvToJson) => {
    setSaberSimData(ssCsvToJson.data);
    parseTableData(ssCsvToJson.data);
  };
  const handleReadRGCsv = (rgCsvToJson) => {
    setRgData(rgCsvToJson.data);
  };

  const generateSuperDraftLineupsAndExport = () => {
    return;
  };

  const handleWeightChange = () => {
    return;
  };

  const exportToCsv = (site) => {
    const config = {
      columns:
        site === "rg"
          ? ["name", "fpts"]
          : site === "ss"
          ? ["Name", "Projection", "Ownership"]
          : ["Lineup Position", "ID+Name", "SuperDraft Projection"],
      download: true,
      skipEmptyLines: true,
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

  return (
    <div style={{ width: "95vw" }}>
      <div>
        <div>
          <div>
            <ol>
              <li>
                Import projections from Awesemo
                <CSVReader
                  onFileLoaded={handleReadAwesemoCsv}
                  configOptions={tableConfig}
                  inputRef={awesemoInput}
                />
              </li>
              <li>
                Import projections from SaberSim
                <CSVReader
                  onFileLoaded={handleReadSSCsv}
                  configOptions={tableConfig}
                  inputRef={ssInput}
                />
              </li>
              <li>
                Convert projections for RotoGrinders
                <CSVReader
                  onFileLoaded={handleReadRGCsv}
                  configOptions={tableConfig}
                  inputRef={rgInput}
                />
              </li>
            </ol>
            <Form id="normalizationForm" style={{ margin: ".5em" }}>
              <Form.Row>
                <Col>
                  <Form.Label>Awesemo Weight</Form.Label>
                  <Form.Control
                    placeholder="RG Weight"
                    name="rgWeight"
                    type="number"
                    required
                    onChange={handleWeightChange}
                    ref={awesemoWeightInput}
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
                  <Form.Label>RG Weight</Form.Label>
                  <Form.Control
                    placeholder="SD Weight"
                    name="SDWeight"
                    type="number"
                    required
                    onChange={handleWeightChange}
                    ref={rgWeightInput}
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
      <div>
        <Table tableData={tableData} tableTitle="Combined Projections"></Table>

        <Table tableData={awesemoData} tableTitle="Awesemo"></Table>

        <Table tableData={saberSimData} tableTitle="SS"></Table>

        <Table tableData={rgData} tableTitle="RG"></Table>
      </div>
    </div>
  );
};

export default KBOPage;
