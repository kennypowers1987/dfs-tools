import React from "react";
import { CSVReader, jsonToCSV } from "react-papaparse";
import { Table } from "./ImportTable";
const data = require("../data/xfl/offenseWeek1.json");
const rushingData = [];

data.forEach(game => {
  game.home.rushing.forEach(obj => {
    obj.player = obj.player.displayName ? obj.player.displayName : obj.player;
    rushingData.push(obj);
  });
  game.away.rushing.forEach(obj => {
    obj.player = obj.player.displayName ? obj.player.displayName : obj.player;
    rushingData.push(obj);
  });
});
const passingData = [];
data.forEach(game => {
  game.home.passing.forEach(obj => {
    obj.player = obj.player.displayName ? obj.player.displayName : obj.player;
    passingData.push(obj);
  });
  game.away.passing.forEach(obj => {
    obj.player = obj.player.displayName ? obj.player.displayName : obj.player;
    passingData.push(obj);
  });
});

const receivingData = [];
data.forEach(game => {
  game.home.receiving.forEach(obj => {
    obj.player = obj.player.displayName ? obj.player.displayName : obj.player;
    receivingData.push(obj);
  });
  game.away.receiving.forEach(obj => {
    obj.player = obj.player.displayName ? obj.player.displayName : obj.player;
    receivingData.push(obj);
  });
});

// Since this component is simple and static, there's no parent container for it.
const XflPage = () => {
  return (
    <div>
      <Table tableData={rushingData} tableTitle="Rushing Leaders"></Table>
      <Table tableData={passingData} tableTitle="Passing Leaders"></Table>
      <Table tableData={receivingData} tableTitle="Receiving Leaders"></Table>
    </div>
  );
};

export default XflPage;
