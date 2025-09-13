import React from 'react';
import { Svg, Path, SvgProps } from 'react-native-svg';

const Wave = (props: SvgProps) => (
  <Svg
    width={props.width ?? 900}
    height={props.width ?? 600}
    viewBox="0 0 900 600"
    {...props}
  >
    <Path
      // fill="#000310"
      strokeLinecap="round"
      d="M0 355 L30 333.5 C60 312 120 269 180 269.3 C240 269.7 300 313.7 360 304.4 C420 295.1 480 227.3 540 237.8 C600 248.3 660 339.9 720 372.7 C780 405.5 840 294 870 285.1 L900 276.3 V0 H0 Z"
    />
  </Svg>
);

export default Wave;
