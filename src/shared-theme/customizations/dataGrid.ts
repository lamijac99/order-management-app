import { paperClasses } from "@mui/material/Paper";
import { alpha } from "@mui/material/styles";
import { menuItemClasses } from "@mui/material/MenuItem";
import { listItemIconClasses } from "@mui/material/ListItemIcon";
import { iconButtonClasses } from "@mui/material/IconButton";
import { inputBaseClasses } from "@mui/material/InputBase";
import { checkboxClasses } from "@mui/material/Checkbox";
import { listClasses } from "@mui/material/List";
import { tablePaginationClasses } from "@mui/material/TablePagination";
import { gridClasses } from "@mui/x-data-grid";
import { gray } from "../themePrimitives";

export const dataGridCustomizations = {
  MuiDataGrid: {
    defaultProps: {
      disableRowSelectionOnClick: true,
      pageSizeOptions: [10, 20, 50],

      rowHeight: 44,
      columnHeaderHeight: 39,

      initialState: {
        pagination: { paginationModel: { pageSize: 20, page: 0 } },
      },
    },

    styleOverrides: {
      root: ({ theme }: any) => ({
        "--DataGrid-overlayHeight": "300px",
        borderRadius: "6px",
        overflow: "clip",
        border: `1px solid ${(theme.vars || theme).palette.divider}`,
        backgroundColor: (theme.vars || theme).palette.background.default,

        [`& .${gridClasses.columnHeader}`]: {
          backgroundColor: (theme.vars || theme).palette.background.paper,
        },
        [`& .${gridClasses.footerContainer}`]: {
          backgroundColor: (theme.vars || theme).palette.background.paper,
        },

        "& .MuiDataGrid-columnHeaders": {
          minHeight: 39,
          maxHeight: 39,
          borderBottom: `1px solid ${(theme.vars || theme).palette.divider}`,
          backgroundColor: (theme.vars || theme).palette.background.paper,
        },
        "& .MuiDataGrid-columnHeader": {
          minHeight: 39,
          maxHeight: 39,
          paddingLeft: 16,
          paddingRight: 16,
          backgroundColor: (theme.vars || theme).palette.background.paper,
        },

        "& .MuiDataGrid-columnHeader.MuiDataGrid-columnHeader--alignRight": {
          justifyContent: "flex-end",
          textAlign: "right",
        },
        "& .MuiDataGrid-columnHeader.MuiDataGrid-columnHeader--alignCenter": {
          justifyContent: "center",
          textAlign: "center",
        },

        "& .MuiDataGrid-row": {
          minHeight: 44,
          maxHeight: 44,
          backgroundColor: (theme.vars || theme).palette.background.default,
        },

        "& .MuiDataGrid-cell": {
          borderTopColor: (theme.vars || theme).palette.divider,
          paddingLeft: 16,
          paddingRight: 16,

          paddingTop: 6,
          paddingBottom: 6,
          lineHeight: "20px",
          minHeight: 44,

          display: "flex",
          alignItems: "center",
        },

        "& .MuiDataGrid-cell.MuiDataGrid-cell--textLeft": {
          justifyContent: "flex-start",
          textAlign: "left",
        },
        "& .MuiDataGrid-cell.MuiDataGrid-cell--textRight": {
          justifyContent: "flex-end",
          textAlign: "right",
        },

        "& .MuiDataGrid-footerContainer": {
          minHeight: 44,
          borderTop: "none",
          backgroundColor: (theme.vars || theme).palette.background.paper,
        },

        "& .MuiDataGrid-row:last-of-type .MuiDataGrid-cell": {
          borderBottom: "none",
        },

        "&.MuiDataGrid-root": {
          border: 0,
        },

        [`& .${checkboxClasses.root}`]: {
          padding: theme.spacing(0.5),
          "& > svg": { fontSize: "1rem" },
        },

        [`& .${tablePaginationClasses.root}`]: {
          marginRight: theme.spacing(1),
          "& .MuiIconButton-root": {
            maxHeight: 32,
            maxWidth: 32,
            borderRadius: 8,
            "& > svg": { fontSize: "1rem" },
          },
        },

        "& .MuiDataGrid-columnSeparator": { display: "none" },
        "& .MuiDataGrid-columnSeparator--resizable": { display: "none" },
        "& .MuiDataGrid-iconSeparator": { display: "none" },

        "& .MuiDataGrid-columnHeaderCheckbox": {
          paddingLeft: 8,
          paddingRight: 8,
          justifyContent: "center",
        },
        "& .MuiDataGrid-cellCheckbox": {
          paddingLeft: 8,
          paddingRight: 8,
          justifyContent: "center",
        },
        "& .MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root": { margin: 0 },
        "& .MuiDataGrid-cellCheckbox .MuiCheckbox-root": { margin: 0 },
        "& .MuiDataGrid-columnHeaderCheckbox, & .MuiDataGrid-cellCheckbox": {
          width: 52,
          minWidth: 52,
          maxWidth: 52,
        },

        "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
          outline: "none",
        },
        "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within": {
          outline: "none",
        },

        "& .MuiDataGrid-toolbarContainer": {
          padding: 12,
          gap: 8,
        },
      }),

      cell: ({ theme }: any) => ({
        borderTopColor: (theme.vars || theme).palette.divider,
      }),

      menu: ({ theme }: any) => ({
        borderRadius: 10,
        backgroundImage: "none",
        [`& .${paperClasses.root}`]: {
          border: `1px solid ${(theme.vars || theme).palette.divider}`,
        },
        [`& .${menuItemClasses.root}`]: { margin: "0 4px" },
        [`& .${listItemIconClasses.root}`]: { marginRight: 0 },
        [`& .${listClasses.root}`]: { paddingLeft: 0, paddingRight: 0 },
      }),

      row: ({ theme }: any) => ({
        "&:last-of-type": {
          borderBottom: "none",
        },
        "&:hover": {
          backgroundColor: (theme.vars || theme).palette.action.hover,
        },
        "&.Mui-selected": {
          background: (theme.vars || theme).palette.action.selected,
          "&:hover": {
            backgroundColor: (theme.vars || theme).palette.action.hover,
          },
        },
      }),

      iconButtonContainer: ({ theme }: any) => ({
        [`& .${iconButtonClasses.root}`]: {
          border: "none",
          backgroundColor: "transparent",
          borderRadius: 10,
          "&:hover": { backgroundColor: alpha(theme.palette.action.selected, 0.3) },
          "&:active": { backgroundColor: gray[200] },
          ...theme.applyStyles("dark", {
            color: gray[50],
            "&:hover": { backgroundColor: gray[800] },
            "&:active": { backgroundColor: gray[900] },
          }),
        },
      }),

      menuIconButton: ({ theme }: any) => ({
        border: "none",
        backgroundColor: "transparent",
        "&:hover": { backgroundColor: gray[100] },
        "&:active": { backgroundColor: gray[200] },
        ...theme.applyStyles("dark", {
          color: gray[50],
          "&:hover": { backgroundColor: gray[800] },
          "&:active": { backgroundColor: gray[900] },
        }),
      }),

      filterForm: ({ theme }: any) => ({
        gap: theme.spacing(1),
        alignItems: "flex-end",
      }),

      columnsManagementHeader: ({ theme }: any) => ({
        paddingRight: theme.spacing(3),
        paddingLeft: theme.spacing(3),
      }),

      columnHeaderTitleContainer: {
        flexGrow: 1,
        justifyContent: "space-between",
      },

      columnHeaderDraggableContainer: { paddingRight: 2 },

      toolbar: ({ theme }: any) => ({
        backgroundColor: (theme.vars || theme).palette.background.paper,
      }),

      toolbarQuickFilter: {
        [`& .${inputBaseClasses.root}`]: {
          marginLeft: 6,
          marginRight: 6,
        },
        [`& .${iconButtonClasses.root}`]: {
          height: "36px",
          width: "36px",
        },
        [`& .${iconButtonClasses.edgeEnd}`]: {
          border: "none",
          height: "28px",
          width: "28px",
        },
      },
    },
  },
};