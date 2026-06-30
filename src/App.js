/**
 * App.js — Admin Portal main application shell.
 *
 * Features:
 * - Top AppBar
 * - Dashboard summary cards
 * - Device table with actions
 * - Auto-refresh every 30 seconds
 * - Snackbar success/error notifications
 * - Loading indicator on initial load
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import RefreshIcon from "@mui/icons-material/Refresh";

import Dashboard from "./components/Dashboard";
import DeviceTable from "./components/DeviceTable";
import {
  listDevices,
  generateInvitationToken,
  revokeInvitationToken,
  resetDevice,
} from "./services/adminService";
import config from "./config/appSettings";

// Material UI theme — matches the mobile PWA styling
const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#9c27b0" },
  },
});

const App = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Fetch device list from the shared backend
  const loadDevices = useCallback(async () => {
    try {
      const data = await listDevices();
      setDevices(data);
      setError("");
    } catch (err) {
      setError(err.detail || "Failed to load devices from the backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadDevices, config.AUTO_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadDevices]);

  // Notification helper
  const notify = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Action handlers — each refreshes the table after completion
  const handleGenerateToken = async (deviceId) => {
    try {
      const updated = await generateInvitationToken(deviceId);
      notify(`Token generated for ${deviceId}: ${updated.invitation_token}`);
      await loadDevices();
    } catch (err) {
      notify(err.detail || `Failed to generate token for ${deviceId}`, "error");
    }
  };

  const handleRevokeToken = async (deviceId) => {
    try {
      await revokeInvitationToken(deviceId);
      notify(`Invitation token revoked for ${deviceId}`);
      await loadDevices();
    } catch (err) {
      notify(err.detail || `Failed to revoke token for ${deviceId}`, "error");
    }
  };

  const handleResetDevice = async (deviceId) => {
    try {
      await resetDevice(deviceId);
      notify(`Device registration reset for ${deviceId}`);
      await loadDevices();
    } catch (err) {
      notify(err.detail || `Failed to reset device for ${deviceId}`, "error");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Top AppBar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <AdminPanelSettingsIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Administrator Portal
          </Typography>
          <Chip
            label="Auto-refresh: 30s"
            size="small"
            color="default"
            variant="outlined"
            sx={{ mr: 1, color: "white", borderColor: "rgba(255,255,255,0.5)" }}
          />
          <Tooltip title="Refresh now">
            <IconButton color="inherit" onClick={loadDevices}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Container maxWidth={false} sx={{ maxWidth: 1500, py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress size={48} />
          </Box>
        ) : (
          <>
            <Dashboard devices={devices} />
            <DeviceTable
              devices={devices}
              onGenerateToken={handleGenerateToken}
              onRevokeToken={handleRevokeToken}
              onResetDevice={handleResetDevice}
            />
          </>
        )}
      </Container>

      {/* Snackbar notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default App;
