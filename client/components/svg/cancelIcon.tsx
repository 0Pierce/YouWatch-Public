import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

const CancelIcon = (props:SvgProps) => (
  <Svg
    width={props.width}
    height={props.height}
    // fill={props.fill}
    stroke={props.fill}
    strokeWidth="3"
    viewBox="0 0 64 64"
  >
    <Path d="m8.06 8.06 47.35 47.88M55.94 8.06 8.59 55.94"></Path>
  </Svg>
);

export default CancelIcon;
