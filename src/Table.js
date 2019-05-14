import React, { Component } from 'react';
import { ResizableBox } from 'react-resizable';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import ReactTable from 'react-table';

import 'react-table/react-table.css';
import 'react-resizable/css/styles.css';

class Table extends Component {
  constructor(props) {
    super(props);
    this.table = React.createRef();
    this.state = {
      selectAll: true,
      filters: [],
    };
  }

  toggleSelectAll() {
    const selectAll = !this.state.selectAll;
    if (this.table.current) {
      const data = this.table.current.getResolvedState().sortedData;
      this.props.selectionChangeListener({
        selected: selectAll,
        selections: data.map(p => p._original.indx),
      });
      this.setState({ selectAll });
    }
  }

  render() {   
    const columns = [{
      accessor: "selected",
      Header: (
        <input
          type="checkbox"
          className="checkbox"
          checked={this.state.selectAll}
          onChange={() => this.toggleSelectAll()}
        />
      ),
      Filter: (
        <IconButton
          className="clear-filter"
          title="Clear all filters"
          onClick={() => this.setState({ filters: [] })}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      ),
      Cell: ({ original }) => (
        <input readOnly
          type="checkbox"
          className="checkbox"
          checked={this.props.data[original.indx].selected}
        />
      ),
      sortable: false,
      width: 30,
    }, {
      Header: "Planet Name",
      accessor: "name",
      width: 150,
    }, {
      Header: "Host Star",
      accessor: "star",
      width: 150,
    }, {
      Header: <span>Mass (M<sub>J</sub>)</span>,
      accessor: "mass",
      width: 80,
    }, {
      Header: <span>Radius (R<sub>J</sub>)</span>,
      accessor: "radi",
      width: 80,
    }, {
      Header: "Orb. Period (days)",
      accessor: "perd",
      width: 110,
    }, {
      Header: "S-Major Axis (AU)",
      accessor: "dist",
      width: 120,
    }, {
      Header: "Detection Type",
      accessor: "type",
      sortable: false,
      width: 120,
    }, {
      Header: "Year",
      accessor: "year",
      width: 60,
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
            selections: [rowInfo.original.indx],
          }),
          style: {
            background: rowInfo.original.selected? "#eee" : "#fff",
          }
        } : {});
    };

    const h = window.innerHeight;
   
    return (
      <div className="Table">
        <ResizableBox
          width={300}
          height={h}
          axis="x"
          resizeHandles={["e"]}
          minConstraints={[300, h]}
          maxConstraints={[900, h]}
        >
          <ReactTable
            ref={this.table}
            data={this.props.data}
            columns={columns}
            showPageSizeOptions={false}
            resizable={false}
            filterable={true}
            filtered={this.state.filters}
            onFilteredChange={filters => this.setState({ filters })}
            defaultFilterMethod={filterCaseInsensitive}
            getTrProps={trProps}
            pageText=""
            noDataText="No results found"
          />
        </ResizableBox>
      </div>
    );
  }
}

export default Table;
