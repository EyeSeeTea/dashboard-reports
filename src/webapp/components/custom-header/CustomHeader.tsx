import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { HeaderOptions } from "../../../app-config";

export type CustomHeaderProps = HeaderOptions;

type StyleProps = Omit<CustomHeaderProps, "title">;

const useStyles = makeStyles(() => ({
    container: (props: StyleProps) => ({
        background: props.background ?? "inherit",
        color: props.color ?? "inherit",
    }),
    title: {
        flexGrow: 1,
    },
}));

export const CustomHeader: React.FC<CustomHeaderProps> = ({ title, ...styleProps }) => {
    const classes = useStyles(styleProps);

    return (
        <AppBar position="static" className={classes.container} elevation={0}>
            <Toolbar>
                <Typography variant="h6" className={classes.title}>
                    {title}
                </Typography>
            </Toolbar>
        </AppBar>
    );
};
