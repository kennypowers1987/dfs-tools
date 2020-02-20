import React from "react";
import PropTypes from "prop-types";
import BootstrapTable from "react-bootstrap-table-next";

export const Table = props => {
  const { tableData, tableTitle } = props;

  const columns = Object.keys(tableData[0]).map(key => {
    
    const column = {
      dataField: key,
      text: key,
      sort: true
    };
    return column;
  });

  const projectionTable = () => {
    return (
      <span>
        <h2>{tableTitle}</h2>
        <BootstrapTable
        className="dataTable"
          striped
          hover
          condensed
          responsive
          wrapperClasses="table-responsive"
          keyField="id"
          data={tableData}
          columns={columns}
          dataSort={ true }
          maxHeight='500px;'
        />
      </span>
    );
  };
  return projectionTable();
};

Table.PropTypes = {
  tableData: PropTypes.array.isRequired
};
