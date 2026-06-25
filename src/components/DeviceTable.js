/**
 * DeviceTable — MUI Table displaying all employee/device records with action buttons.
 *
 * Columns: Location, Employee ID, Company Email, Registration Status, Credential ID,
 *          Registered, Last Login, Invitation Token, Token Expiry
 *
 * Actions per row:
 *  - Generate Invitation Token
 *  - Revoke Invitation Token (with confirmation)
 *  - Reset Device (with confirmation)
 */
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import KeyOffIcon from "@mui/icons-material/KeyOff";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const DeviceTable = ({ devices, onGenerateToken, onRevokeToken, onResetDevice }) => {
  const [busyRow, setBusyRow] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const formatDate = (isoString) => {
    if (!isoString) return "—";
    return new Date(isoString).toLocaleString();
  };

  const truncate = (value) => {
    if (!value) return "—";
    if (value.length <= 16) return value;
    return `${value.substring(0, 8)}…${value.substring(value.length - 6)}`;
  };

  const statusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "revoked":
        return "error";
      case "not_registered":
        return "default";
      default:
        return "default";
    }
  };

  const handleAction = async (action, employeeId) => {
    setBusyRow(`${employeeId}:${action}`);
    try {
      if (action === "gen") await onGenerateToken(employeeId);
      else if (action === "revtoken") await onRevokeToken(employeeId);
      else if (action === "reset") await onResetDevice(employeeId);
    } finally {
      setBusyRow(null);
    }
  };

  const openConfirm = (action, employeeId, message) => {
    setConfirmDialog({ action, employeeId, message });
  };

  const closeConfirm = () => setConfirmDialog(null);

  const confirmAndRun = () => {
    if (confirmDialog) {
      handleAction(confirmDialog.action, confirmDialog.employeeId);
    }
    closeConfirm();
  };

  return (
    <>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ "& th": { fontWeight: 600 } }}>
              <TableCell>Location</TableCell>
              <TableCell>Employee ID</TableCell>
              <TableCell>Company Email</TableCell>
              <TableCell>Registration Status</TableCell>
              <TableCell>Credential ID</TableCell>
              <TableCell>Registered</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Invitation Token</TableCell>
              <TableCell>Token Expiry</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.map((device) => {
              const hasToken = Boolean(device.invitation_token) && !device.invitation_token_used;
              return (
                <TableRow key={device.employee_id} hover>
                  <TableCell>{device.location}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{device.employee_id}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{device.company_email}</TableCell>
                  <TableCell>
                    <Chip
                      label={device.status}
                      color={statusColor(device.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>
                    {truncate(device.credential_id)}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>
                    {formatDate(device.registered_at)}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>
                    {formatDate(device.last_login)}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>
                    {device.invitation_token
                      ? device.invitation_token_used
                        ? <Chip label="Used" size="small" variant="outlined" />
                        : device.invitation_token
                      : "—"}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>
                    {formatDate(device.invitation_token_expiry)}
                  </TableCell>
                  <TableCell align="center">
                    <Stack spacing={0.5} sx={{ minWidth: 180 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        startIcon={
                          busyRow === `${device.employee_id}:gen`
                            ? <CircularProgress size={14} />
                            : <VpnKeyIcon />
                        }
                        disabled={busyRow !== null}
                        onClick={() => handleAction("gen", device.employee_id)}
                      >
                        Generate Token
                      </Button>
                      <Button
                        variant="outlined"
                        color="warning"
                        size="small"
                        startIcon={
                          busyRow === `${device.employee_id}:revtoken`
                            ? <CircularProgress size={14} />
                            : <KeyOffIcon />
                        }
                        disabled={busyRow !== null || !hasToken}
                        onClick={() =>
                          openConfirm(
                            "revtoken",
                            device.employee_id,
                            `Revoke the invitation token for ${device.employee_id}? The employee will not be able to register until a new token is generated.`
                          )
                        }
                      >
                        Revoke Token
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={
                          busyRow === `${device.employee_id}:reset`
                            ? <CircularProgress size={14} />
                            : <RestartAltIcon />
                        }
                        disabled={busyRow !== null || !device.is_registered}
                        onClick={() =>
                          openConfirm(
                            "reset",
                            device.employee_id,
                            `Reset device registration for ${device.employee_id}? This will remove the passkey and session. The device must register again.`
                          )
                        }
                      >
                        Reset Device
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmation Dialog */}
      <Dialog open={Boolean(confirmDialog)} onClose={closeConfirm}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog?.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm}>Cancel</Button>
          <Button onClick={confirmAndRun} variant="contained" color="error" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeviceTable;
