import {
    Button,
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TablePagination,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
} from '@mui/material';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Plus } from '../lib/icons.component';

const Environment = ({ properties }: any) => {
    const [env, setEnv] = useState<any>([]);
    const [status, setStatus] = useState<{
        isLoading: boolean;
        dialogIsOpen: boolean;
    }>({
        isLoading: false,
        dialogIsOpen: false,
    });
    const [data, setData] = useState<any>({
        key: '',
        value: '',
    });
    const [page, setPage] = useState<number>(0);
    const [rowPerPage, setRowPerPage] = useState<number>(10);

    const handleData = (key: string, value: string | number) => {
        setData({ ...data, [key]: value });
    };
    const handleStatus = (key: string, value: boolean) => {
        setStatus({ ...status, [key]: value });
    };

    function closeDialog() {
        setStatus({
            isLoading: false,
            dialogIsOpen: false,
        });
        setData({
            key: '',
            value: '',
        });
    }

    useEffect(() => {
        axios
            .get(process.env.REACT_APP_ENV_URL ?? '', {
                auth: {
                    username: process.env.REACT_APP_AUTH_USERNAME ?? '',
                    password: process.env.REACT_APP_AUTH_PASSWORD ?? '',
                },
            })
            .then((e) => {
                const data = Object.entries(e.data).map(([key, value]) => ({
                    key,
                    value,
                }));
                setEnv(data);
            });
    }, []);

    const SubmitEnv = (method: 'update' | 'add' | 'delete') => {
        handleStatus('isLoading', true);
        delete data?.properties;
        let body;

        if (method === 'delete') body = { [data.key]: null };
        else body = { [data.key]: data.value };

        axios
            .patch(process.env.REACT_APP_ENV_URL ?? '', body, {
                auth: {
                    username: process.env.REACT_APP_AUTH_USERNAME ?? '',
                    password: process.env.REACT_APP_AUTH_PASSWORD ?? '',
                },
            })
            .then((e) => {
                const data = Object.entries(e.data).map(([key, value]) => ({
                    key,
                    value,
                }));
                setEnv(data);
                closeDialog();
            });
    };

    const UpdateEnv = (env: any) => {
        handleStatus('dialogIsOpen', true);
        setData({
            ...env,
            properties: { isUpdate: true },
        });
    };

    const columns = [
        {
            id: 'key',
            label: 'Key',
            minWidth: 170,
        },
        {
            id: 'value',
            label: 'Value',
            minWidth: 100,
        },
    ];

    return (
        <div className="m-10">
            <Button
                variant="contained"
                className="mb-10"
                startIcon={<Plus />}
                onClick={() => handleStatus('dialogIsOpen', true)}
            >
                Add Variable
            </Button>
            <TableContainer>
                <Table className="card">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align="left"
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {env && env?.length > 0 ? (
                            env
                                .slice(
                                    page * rowPerPage,
                                    page * rowPerPage + rowPerPage
                                )
                                .map((song: any, index: number) => {
                                    return (
                                        <TableRow
                                            hover
                                            key={index}
                                            onClick={() => UpdateEnv(song)}
                                        >
                                            {columns.map((column) => {
                                                return (
                                                    <TableCell key={column.id}>
                                                        {song[column.id]}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3}>
                                    <LinearProgress />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                className="card"
                component="div"
                count={env.length ?? 0}
                rowsPerPage={rowPerPage}
                page={page}
                onPageChange={(_, newPage) => {
                    setPage(newPage);
                }}
                onRowsPerPageChange={(e) => {
                    setPage(0);
                    setRowPerPage(+e.target.value);
                }}
            />

            <Dialog
                fullWidth
                open={status.dialogIsOpen}
                onClose={() => closeDialog()}
            >
                <DialogTitle className="error">
                    {data?.properties?.isUpdate ? 'Edit' : 'Add'} Environment
                    Variable
                </DialogTitle>
                <DialogContent>
                    {Object.keys(columns).map((_, index: number) => {
                        const { id, label } = columns[index];
                        return (
                            <TextField
                                id={id}
                                required
                                fullWidth
                                key={index}
                                type="text"
                                label={label}
                                margin="dense"
                                variant="standard"
                                multiline={id === 'value'}
                                value={data[id].replace(/\\n/g, '\n')}
                                disabled={
                                    data?.properties?.isUpdate && id === 'key'
                                }
                                onChange={(e) => {
                                    !data?.properties?.isUpdate
                                        ? handleData(id, e.target.value)
                                        : id !== 'key' &&
                                          handleData(id, e.target.value);
                                }}
                            />
                        );
                    })}
                </DialogContent>
                <DialogActions>
                    {data?.properties?.isUpdate ? (
                        <Button
                            color="error"
                            onDoubleClick={() => SubmitEnv('delete')}
                        >
                            Delete
                        </Button>
                    ) : null}
                    <Button color="inherit" onClick={() => closeDialog()}>
                        Cancel
                    </Button>
                    <Button
                        disabled={status.isLoading}
                        onClick={() =>
                            SubmitEnv(
                                data?.properties?.isUpdate === true
                                    ? 'update'
                                    : 'add'
                            )
                        }
                    >
                        {data?.properties?.isUpdate === true ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Environment;
