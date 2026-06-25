/**
 * Dashboard — Summary cards showing device/token statistics.
 */
import React from "react";
import { Box, Card, CardContent, Typography, Grid } from "@mui/material";
import DevicesIcon from "@mui/icons-material/Devices";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import TimerOffIcon from "@mui/icons-material/TimerOff";

const StatCard = ({ title, value, icon, color }) => (
  <Card variant="outlined" sx={{ height: "100%" }}>
    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Box sx={{ color, display: "flex" }}>{icon}</Box>
      <Box>
        <Typography variant="h4" component="div" fontWeight={600}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = ({ devices }) => {
  const total = devices.length;
  const registered = devices.filter((d) => d.is_registered).length;
  const unregistered = total - registered;

  const now = new Date();
  const tokensActive = devices.filter(
    (d) =>
      d.invitation_token &&
      !d.invitation_token_used &&
      d.invitation_token_expiry &&
      new Date(d.invitation_token_expiry) > now
  ).length;

  const tokensExpired = devices.filter(
    (d) =>
      d.invitation_token_expiry &&
      !d.invitation_token_used &&
      new Date(d.invitation_token_expiry) <= now
  ).length;

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Devices"
            value={total}
            icon={<DevicesIcon fontSize="large" />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Registered Devices"
            value={registered}
            icon={<CheckCircleIcon fontSize="large" />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Unregistered Devices"
            value={unregistered}
            icon={<CancelIcon fontSize="large" />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Tokens Active"
            value={tokensActive}
            icon={<VpnKeyIcon fontSize="large" />}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Tokens Expired"
            value={tokensExpired}
            icon={<TimerOffIcon fontSize="large" />}
            color="error.main"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
