import "./index.css";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  deleteUptimeMonitor,
  getUptimeMonitorsByTeamId,
} from "../../Features/UptimeMonitors/uptimeMonitorsSlice";
import { useNavigate } from "react-router-dom";
import Button from "../../Components/Button";
import ServerStatus from "../../Components/Charts/Servers/ServerStatus";
import { useTheme } from "@emotion/react";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import BasicTable from "../../Components/BasicTable";
import { StatusLabel } from "../../Components/Label";
import { createToast } from "../../Utils/toastUtils";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";

import Settings from "../../assets/icons/settings-bold.svg?react";
import PropTypes from "prop-types";
import BarChart from "../../Components/Charts/BarChart";

const ActionsMenu = ({ monitor }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [actions, setActions] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const theme = useTheme();
  const authState = useSelector((state) => state.auth);
  const handleRemove = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    let monitor = { _id: actions.id };
    const action = await dispatch(
      deleteUptimeMonitor({ authToken: authState.authToken, monitor })
    );
    if (action.meta.requestStatus === "fulfilled") {
      setIsOpen(false); // close modal
      dispatch(getUptimeMonitorsByTeamId(authState.authToken));
      createToast({ body: "Monitor deleted successfully." });
    } else {
      createToast({ body: "Failed to delete monitor." });
    }
  };

  const openMenu = (event, id, url) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setActions({ id: id, url: url });
  };

  const openRemove = (e) => {
    closeMenu(e);
    setIsOpen(true);
  };

  const closeMenu = (e) => {
    e.stopPropagation();
    setAnchorEl(null);
  };

  const navigate = useNavigate();
  return (
    <>
      <IconButton
        aria-label="monitor actions"
        onClick={(event) => {
          event.stopPropagation();
          openMenu(
            event,
            monitor._id,
            monitor.type === "ping" ? null : monitor.url
          );
        }}
        sx={{
          "&:focus": {
            outline: "none",
          },
        }}
      >
        <Settings />
      </IconButton>

      <Menu
        className="actions-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={(e) => closeMenu(e)}
      >
        {actions.url !== null ? (
          <MenuItem
            onClick={(e) => {
              closeMenu(e);
              e.stopPropagation();
              window.open(actions.url, "_blank", "noreferrer");
            }}
          >
            Open site
          </MenuItem>
        ) : (
          ""
        )}
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/monitors/${actions.id}`);
          }}
        >
          Details
        </MenuItem>
        {/* TODO - pass monitor id to Incidents page */}
        <MenuItem disabled>Incidents</MenuItem>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();

            navigate(`/monitors/configure/${actions.id}`);
          }}
        >
          Configure
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            openRemove(e);
          }}
        >
          Remove
        </MenuItem>
      </Menu>
      <Modal
        aria-labelledby="modal-delete-monitor"
        aria-describedby="delete-monitor-confirmation"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        disablePortal
      >
        <Stack
          gap={theme.gap.xs}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "white",
            border: "solid 1px #f2f2f2",
            borderRadius: `${theme.shape.borderRadius}px`,
            boxShadow: 24,
            p: "30px",
            "&:focus": {
              outline: "none",
            },
          }}
        >
          <Typography id="modal-delete-monitor" component="h2">
            Do you really want to delete this monitor?
          </Typography>
          <Typography id="delete-monitor-confirmation">
            Once deleted, this monitor cannot be retrieved.
          </Typography>
          <Stack
            direction="row"
            gap={theme.gap.small}
            mt={theme.gap.large}
            justifyContent="flex-end"
          >
            <Button
              level="tertiary"
              label="Cancel"
              onClick={() => setIsOpen(false)}
            />
            <Button
              level="error"
              label="Delete"
              onClick={(e) => handleRemove(e)}
            />
          </Stack>
        </Stack>
      </Modal>
    </>
  );
};

ActionsMenu.propTypes = {
  monitor: PropTypes.shape({
    _id: PropTypes.string,
    url: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
};

/**
 * Host component.
 * This subcomponent receives a params object and displays the host details.
 *
 * @component
 * @param {Object} params - An object containing the following properties:
 * @param {string} params.title - The name of the host.
 * @param {string} params.percentageColor - The color of the percentage text.
 * @param {number} params.percentage - The percentage to display.
 * @returns {React.ElementType} Returns a div element with the host details.
 */
const Host = ({ params }) => {
  return (
    <Stack direction="row" alignItems="baseline" className="host">
      {params.title}
      <Typography component="span" sx={{ color: params.percentageColor }}>
        {params.percentage}%
      </Typography>
    </Stack>
  );
};

Host.propTypes = {
  params: PropTypes.shape({
    title: PropTypes.string,
    percentageColor: PropTypes.string,
    percentage: PropTypes.number,
  }).isRequired,
};

/**
 * Renders a skeleton layout.
 *
 * @returns {JSX.Element}
 */
const SkeletonLayout = () => {
  const theme = useTheme();

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Skeleton variant="rounded" width="50%" height={36} />
        <Skeleton variant="rounded" width="15%" height={36} />
      </Stack>
      <Stack
        gap={theme.gap.large}
        direction="row"
        justifyContent="space-between"
      >
        <Skeleton variant="rounded" width="100%" height={100} />
        <Skeleton variant="rounded" width="100%" height={100} />
        <Skeleton variant="rounded" width="100%" height={100} />
      </Stack>
      <Stack gap={theme.gap.large} p={theme.gap.xl} backgroundColor="#f9fafb">
        <Skeleton variant="rounded" width="50%" height={25} />
        <Skeleton variant="rounded" width="100%" height={300} />
        <Skeleton variant="rounded" width="100%" height={100} />
      </Stack>
    </>
  );
};

const Monitors = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const monitorState = useSelector((state) => state.uptimeMonitors);
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch({});

  useEffect(() => {
    dispatch(getUptimeMonitorsByTeamId(authState.authToken));
  }, [authState.authToken, dispatch]);

  const up = monitorState.monitors.reduce((acc, cur) => {
    return cur.status === true ? acc + 1 : acc;
  }, 0);

  const down = monitorState.monitors.length - up;

  const data = {
    cols: [
      { id: 1, name: "Host" },
      {
        id: 2,
        name: (
          <Box width="max-content">
            Status
            <span>
              <ArrowDownwardRoundedIcon />
            </span>
          </Box>
        ),
      },
      { id: 3, name: "Response Time" },
      { id: 4, name: "Type" },
      { id: 5, name: "Actions" },
    ],
    rows: [],
  };

  data.rows = monitorState.monitors.map((monitor, idx) => {
    const params = {
      title: monitor.name,
      percentage: 100,
      percentageColor:
        monitor.status === true
          ? "var(--env-var-color-17)"
          : "var(--env-var-color-19)",
      status: monitor.status === true ? "up" : "down",
    };

    // Reverse checks so latest check is on the right
    const reversedChecks = monitor.checks.slice().reverse();

    return {
      id: monitor._id,
      // disabled for now
      handleClick: () => {
        navigate(`/monitors/${monitor._id}`);
      },
      data: [
        { id: idx, data: <Host params={params} /> },
        {
          id: idx + 1,
          data: (
            <StatusLabel
              status={params.status}
              text={params.status}
              customStyles={{ textTransform: "capitalize" }}
            />
          ),
        },
        { id: idx + 2, data: <BarChart checks={reversedChecks} /> },
        {
          id: idx + 3,
          data: (
            <span style={{ textTransform: "uppercase" }}>{monitor.type}</span>
          ),
        },
        {
          id: idx + 4,
          data: <ActionsMenu monitor={monitor} />,
        },
      ],
    };
  });

  let loading = monitorState.isLoading && monitorState.monitors.length === 0;

  return (
    <Stack className="monitors" gap={theme.gap.large}>
      {loading ? (
        <SkeletonLayout />
      ) : (
        <>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              component="h1"
              sx={{ lineHeight: 1, alignSelf: "flex-end" }}
            >
              Hello, {authState.user.firstName}
            </Typography>
            {monitorState.monitors?.length !== 0 && (
              <Button
                level="primary"
                label="Create monitor"
                onClick={() => {
                  navigate("/monitors/create");
                }}
                sx={{ fontWeight: 500 }}
              />
            )}
          </Stack>
          {monitorState.monitors?.length === 0 ? (
            <Stack
              alignItems="center"
              backgroundColor={theme.palette.otherColors.white}
              p={theme.gap.xxl}
              gap={theme.gap.xs}
              border={1}
              borderRadius={`${theme.shape.borderRadius}px`}
              borderColor={theme.palette.otherColors.graishWhite}
            >
              <Typography component="h2">No monitors found</Typography>
              <Typography>
                It looks like you don’t have any monitors set up yet.
              </Typography>
              <Button
                level="primary"
                label="Create your first monitor"
                onClick={() => {
                  navigate("/monitors/create");
                }}
                sx={{ mt: theme.gap.large }}
              />
            </Stack>
          ) : (
            <>
              <Stack
                gap={theme.gap.large}
                direction="row"
                justifyContent="space-between"
              >
                <ServerStatus title="Up" value={up} state="up" />
                <ServerStatus title="Down" value={down} state="down" />
                <ServerStatus title="Paused" value={0} state="pause" />
              </Stack>
              <Box
                flex={1}
                p={theme.gap.lgplus}
                border={1}
                borderColor={theme.palette.otherColors.graishWhite}
                backgroundColor={theme.palette.otherColors.white}
                sx={{
                  borderRadius: `${theme.shape.borderRadius}px`,
                }}
              >
                <Stack direction="row" alignItems="center" mb={theme.gap.large}>
                  <Typography component="h2">Current monitors</Typography>
                  <Box className="current-monitors-counter">
                    {monitorState.monitors.length}
                  </Box>
                  {/* TODO - add search bar */}
                </Stack>
                <BasicTable data={data} paginated={true} table={"monitors"} />
              </Box>
            </>
          )}
        </>
      )}
    </Stack>
  );
};

export default Monitors;
