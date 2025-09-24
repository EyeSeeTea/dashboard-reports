import React from "react";
import { Typography, Box, makeStyles } from "@material-ui/core";
import { FooterOptions } from "../../../app-config";

export type CustomFooterProps = FooterOptions;

type StyleProps = Omit<CustomFooterProps, "text">;

const useStyles = makeStyles(() => ({
    container: (props: StyleProps) => ({
        background: props.background ?? "inherit",
        color: props.color ?? "inherit",
    }),
    text: {
        whiteSpace: "pre-line",
    },
}));

export const CustomFooter: React.FC<CustomFooterProps> = ({ text, ...styleProps }) => {
    const classes = useStyles(styleProps);
    return (
        <Box component="footer" py={4} px={6} className={classes.container}>
            <Typography variant="body2" className={classes.text}>
                {text}
            </Typography>
        </Box>
    );
};
