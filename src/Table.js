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

  FilterInputMinMax = ({ filter, onChange }) => {
    const min = filter ? filter.value.min : "";
    const max = filter ? filter.value.max : "";
    return (
      <div>
        <input
          type="number"
          placeholder="min"
          value={min}
          onChange={e => onChange({ min: e.target.value, max })}
          style={{ width: "50%" }}
        />
        <input
          type="number"
          placeholder="max"
          value={max}
          onChange={e => onChange({ min, max: e.target.value })}
          style={{ width: "50%" }}
        />
      </div>
    );
  };

  render() {
    const filterCaseInsensitive = (filter, row) => {
      const src = row[filter.pivotId || filter.id];
      const qry = filter.value.trim().toLowerCase();
      return src === undefined || String(src).toLowerCase().includes(qry);
    };
    const filterNumericalMinMax = (filter, row) => {
      const src = row[filter.pivotId || filter.id];
      const min = Number(filter.value.min) || 0;
      const max = Number(filter.value.max) || Infinity;
      const empty = !filter.value.min && !filter.value.max;
      return empty || (src && src >= min && src <= max);
    };

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
      accessor: "name",
      Header: "Planet Name",
      width: 150,
    }, {
      accessor: "star",
      Header: "Host Star",
      width: 150,
    }, {
      accessor: "mass",
      Header: <span>Mass (M<sub>J</sub>)</span>,
      Filter: this.FilterInputMinMax,
      filterMethod: filterNumericalMinMax,
      width: 120,
    }, {
      accessor: "radi",
      Header: <span>Radius (R<sub>J</sub>)</span>,
      Filter: this.FilterInputMinMax,
      filterMethod: filterNumericalMinMax,
      width: 120,
    }, {
      accessor: "perd",
      Header: "Orb. Period (days)",
      Filter: this.FilterInputMinMax,
      filterMethod: filterNumericalMinMax,
      width: 120,
    }, {
      accessor: "dist",
      Header: "S-Major Axis (AU)",
      Filter: this.FilterInputMinMax,
      filterMethod: filterNumericalMinMax,
      width: 120,
    }, {
      accessor: "type",
      Header: "Detection Type",
      sortable: false,
      width: 120,
    }, {
      accessor: "year",
      Header: "Year",
      width: 60,
    }];

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
          maxConstraints={[1000, h]}
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
