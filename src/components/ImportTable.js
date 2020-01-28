import React from 'react';
import PropTypes from "prop-types";

export const Table = (props) => {
  const { tableData, tableTitle } = props;
  console.log(tableData)

  const renderTableHeader = () => {
    let header = Object.keys(tableData[0])
    return header.map((key, index) => {
       return <th key={index}>{key.toUpperCase()}</th>
    })
  }

  const renderTableData = () => {
    return tableData.map((player, index) => {      
      return (
         <tr key={index}>
            {Object.keys(player).map((k, i)=>{
            return (<td key={i}>{player[k]}</td>)
            })}
         </tr>
      )
   })
  }

  const projectionTable = () => {
     return (
        <span>
           <h2>{tableTitle}</h2>
           <table>
              <tbody>
                 <tr>{renderTableHeader()}</tr>
                 {renderTableData()}
              </tbody>
           </table>
        </span>
     )
  }
  return projectionTable();
}

Table.PropTypes = {
  tableData:PropTypes.array.isRequired
}