import React, { Component } from 'react';
import ReactTable from 'react-table';
import Button from '@material-ui/core/Button';
import 'react-table/react-table.css';

class Table extends Component {
  constructor(props) {
    super(props);
    this.table = React.createRef();
  }

  updateSelection(selected) {
    if (this.table.current) {
      const data = this.table.current.getResolvedState().sortedData;
      this.props.selectionChangeListener({
        selected,
        selections: data.map(d => d.star),
      });
    }
  }

  render() {   
    const columns = [{
      Header: "Star Name",
      accessor: "star",
      width: 150,
    }, {
      id: "pCount",
      Header: "# Planets",
      accessor: d => d.planets.length,
      width: 100,
    }];

    const filterCaseInsensitive = (filter, row) => {
      const src = row[filter.pivotId || filter.id];
      const qry = filter.value.toLowerCase();
      return src === undefined || String(src).toLowerCase().includes(qry);
    };

    const trProps = (state, rowInfo) => {
      return (rowInfo && rowInfo.original?
        {
          onClick: () => this.props.selectionChangeListener({
            selected: !rowInfo.original.selected,
            selections: [rowInfo.original.star],
          }),
          style: {
            background: rowInfo.original.selected? "#eee" : "#fff",
          }
        } : {});
    };
   
    return (
      <div className="Table">
        <ReactTable
          ref={this.table}
          data={Object.values(this.props.data)}
          columns={columns}
          showPageSizeOptions={false}
          resizable={false}
          filterable={true}
          defaultFilterMethod={filterCaseInsensitive}
          getTrProps={trProps}
          pageText=""
          noDataText="No results found"
        />
        <div className="select-bar">
          <Button size="small" onClick={() => this.updateSelection(true)}>
            Select All
          </Button>
          <Button size="small" onClick={() => this.updateSelection(false)}>
            Deselect All
          </Button>
        </div>
      </div>
    );
  }
}

export default Table;
