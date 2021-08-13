import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles, withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import { useSelector, useDispatch } from 'react-redux';
import { todosActions } from '../store/todos-slice';
import { AddCircleOutline, Cancel, FilterList } from '@material-ui/icons';
import {
  TextField,
  Button,
  Slide,
  NativeSelect,
  FormControl,
  InputBase,
} from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

const BootstrapInput = withStyles((theme) => ({
  root: {
    'label + &': {
      marginTop: theme.spacing(3),
    },
  },
  input: {
    borderRadius: 4,
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #ced4da',
    fontSize: 16,
    padding: '10px 26px 10px 12px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:focus': {
      borderRadius: 4,
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
    },
  },
}))(InputBase);

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'id', numeric: false, disablePadding: false, label: 'No' },
  { id: 'username', numeric: false, disablePadding: true, label: 'Username' },
  { id: 'title', numeric: false, disablePadding: false, label: 'Title' },
  { id: 'completed', numeric: false, disablePadding: false, label: 'Status' },
];

function EnhancedTableHead(props) {
  const {
    classes,
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding='checkbox'>
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all desserts' }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align='left'
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: '1 1 100%',
    textAlign: 'left',
  },
  addPaper: {
    paddingBlock: 10,
    dispaly: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relevent',
  },
  filterPaper: {
    paddingBlock: 10,
    dispaly: 'flex',
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputField: { marginInline: 10 },
  closeButton: { marginRight: 20 },
}));

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { numSelected, selected, emptyArray, filterData, filterDataBy } = props;
  const [modalVisible, setModalVisible] = React.useState(false);
  const [filterModalVisible, setFilterModalVisible] = React.useState(false);
  const [headerVisible, setHeaderVisible] = React.useState(true);
  const [title, setTitle] = React.useState('');
  const [id, setId] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [completed, setCompleted] = React.useState(false);
  const [filter, setFilter] = React.useState('');
  const dispatch = useDispatch();
  const [filterBy, setFilterBy] = React.useState('');
  const handleDelete = () => {
    dispatch(todosActions.deleteTodo(selected));
    emptyArray();
  };

  const handleAdd = () => {
    const newTodo = { id, username, title, completed };
    if (
      newTodo.id !== '' &&
      newTodo.username !== '' &&
      newTodo.title !== '' &&
      newTodo.completed !== ''
    ) {
      dispatch(todosActions.addNewTodo(newTodo));
      setTitle('');
      setId('');
      setUsername('');
      setCompleted(false);
    } else {
      alert('Empty Input');
    }
  };

  const filterRow = (e) => {
    setFilter(e.target.value);
    filterData(e.target.value);
  };

  const modal = () => (
    <Slide
      direction='down'
      in={modalVisible}
      style={{ transformOrigin: '0 0 0' }}
      {...(modalVisible ? { timeout: 1000 } : {})}
    >
      <Paper elevation={10} className={classes.addPaper}>
        <TextField
          variant='outlined'
          id='id'
          label='Id'
          value={id}
          onChange={(e) => setId(Number(e.target.value))}
          size='small'
          className={classes.inputField}
        />
        <TextField
          variant='outlined'
          id='username'
          label='Username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          size='small'
          className={classes.inputField}
        />
        <TextField
          variant='outlined'
          id='title'
          label='Title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          size='small'
          className={classes.inputField}
        />
        <FormControlLabel
          control={
            <Switch
              checked={completed}
              onChange={() => setCompleted(!completed)}
              name='completed'
              color='secondary'
            />
          }
          label={completed ? 'Done' : 'Undone'}
        />
        <Button
          className={classes.inputField}
          variant='contained'
          size='medium'
          color='secondary'
          onClick={handleAdd}
        >
          Add
        </Button>
        <Tooltip title='close'>
          <IconButton
            className={classes.inputField}
            variant='contained'
            size='medium'
            onClick={() => {
              setModalVisible(!modalVisible);
              setHeaderVisible(true);
            }}
          >
            <Cancel />
          </IconButton>
        </Tooltip>
      </Paper>
    </Slide>
  );

  const filterModal = () => (
    <Slide
      direction='down'
      in={filterModalVisible}
      style={{ transformOrigin: '0 0 0' }}
      {...(filterModalVisible ? { timeout: 1000 } : {})}
    >
      <Paper elevation={10} className={classes.filterPaper}>
        <div
          style={{
            width: '100%',
            paddingRight: 100,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              paddingInline: 30,
            }}
          >
            {/* <Typography
              htmlFor='filter'
              color='inherit'
              variant='subtitle1'
              component='label'
            >
              Filter
            </Typography> */}
            <FormControl style={{ marginLeft: 10 }}>
              <NativeSelect
                id='demo-customized-select-native'
                value={filterBy}
                onChange={(e) => {
                  setFilterBy(e.target.value);
                  filterDataBy(e.target.value);
                }}
                input={<BootstrapInput />}
              >
                <option aria-label='None' value='' disabled>
                  FilterBy
                </option>
                <option value='username'>Username</option>
                <option value='title'>Title</option>
              </NativeSelect>
            </FormControl>
            <TextField
              variant='outlined'
              id='filter'
              label='Filter'
              value={filter}
              onChange={(e) => filterRow(e)}
              size='small'
              className={classes.inputField}
            />
          </div>

          <Tooltip title='close' className={classes.closeButton}>
            <IconButton
              variant='contained'
              size='medium'
              onClick={() => {
                setFilterModalVisible(!filterModalVisible);
                setHeaderVisible(true);
              }}
            >
              <Cancel />
            </IconButton>
          </Tooltip>
        </div>
      </Paper>
    </Slide>
  );

  return (
    <>
      {modalVisible && modal()} {filterModalVisible && filterModal()}{' '}
      {headerVisible && (
        <Slide
          direction='down'
          in={headerVisible}
          style={{ transformOrigin: '0 0 0' }}
          {...(headerVisible ? { timeout: 1000 } : {})}
        >
          <Paper elevation={10}>
            <Toolbar
              className={clsx(classes.root, {
                [classes.highlight]: numSelected > 0,
              })}
            >
              {numSelected > 0 ? (
                <Typography
                  className={classes.title}
                  color='inherit'
                  variant='subtitle1'
                  component='div'
                >
                  {numSelected} selected
                </Typography>
              ) : (
                <Typography
                  className={classes.title}
                  variant='h6'
                  id='tableTitle'
                  component='div'
                >
                  Projects
                </Typography>
              )}

              {numSelected > 0 ? (
                <Tooltip title='Delete'>
                  <IconButton aria-label='delete' onClick={handleDelete}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                  <Tooltip title='Add new'>
                    <IconButton
                      aria-label='filter list'
                      onClick={() => {
                        setModalVisible(true);
                        setFilterModalVisible(false);
                        setHeaderVisible(false);
                      }}
                    >
                      <AddCircleOutline fontSize='large' />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title='Filter'>
                    <IconButton
                      aria-label='filter'
                      onClick={() => {
                        setFilterModalVisible(true);
                        setModalVisible(false);
                        setHeaderVisible(false);
                      }}
                    >
                      <FilterList />
                    </IconButton>
                  </Tooltip>
                </div>
              )}
            </Toolbar>
          </Paper>
        </Slide>
      )}
    </>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  selected: PropTypes.array.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexSlide: 3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  paper: {
    width: '70%',
    height: '100%',
    marginBottom: theme.spacing(2),
    overflowY: 'scroll',
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
  container: {
    maxHeight: '80vh',
  },
}));

const Todos = () => {
  const classes = useStyles();
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('id');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [filterBy, setFilterBy] = React.useState('');
  const [filterSelect, setFilterSelect] = React.useState('');
  const rows = useSelector((state) => state.todos.data);
  const [rowsPerPage, setRowsPerPage] = React.useState(
    rows.length > 50 ? 50 : 10
  );
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const filteredRows = () => {
    if (filterBy !== '') {
      if (filterSelect === 'title') {
        return rows
          .filter((row) => row.title.includes(filterBy))
          .map((row) => row);
      } else if (filterSelect === 'username') {
        return rows
          .filter((row) => row.username.includes(filterBy))
          .map((row) => row);
      } else {
        return rows;
      }
    } else return rows;
  };
  const isSelected = (name) => selected.indexOf(name) !== -1;

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  return (
    <div className={classes.root}>
      <Paper elevation={15} className={classes.paper}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          selected={selected}
          emptyArray={() => setSelected([])}
          rows={rows}
          filterData={(filter) => setFilterBy(filter)}
          filterDataBy={(select) => setFilterSelect(select)}
        />
        <TableContainer className={classes.container}>
          <Table
            className={classes.table}
            aria-labelledby='tableTitle'
            size='medium'
            aria-label='enhanced table'
            stickyHeader
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(filteredRows(), getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.id)}
                      role='checkbox'
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={index}
                      selected={isItemSelected}
                    >
                      <TableCell padding='checkbox'>
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </TableCell>
                      <TableCell align='left'>{row.id}</TableCell>
                      <TableCell
                        component='th'
                        id={labelId}
                        scope='row'
                        padding='none'
                      >
                        {row.username}
                      </TableCell>

                      <TableCell align='left'>{row.title}</TableCell>
                      <TableCell align='left'>
                        {row.completed ? 'Done' : 'Undone'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component='div'
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
};

export default Todos;
