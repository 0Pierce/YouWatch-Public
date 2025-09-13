import Svg, { Path, SvgProps } from "react-native-svg";

const Wave2 = (props: SvgProps) => (
  <Svg
    width={props.width ?? 900}
    height={props.height ?? 600}
    viewBox="0 0 900 600"
    {...props}
  >
    <Path
      fill={props.fill ?? "#2A2E45"}
      strokeLinecap="round"
      d="m0 207 30 .5c30 .5 90 1.5 150 10s120 24.5 180 29.3c60 4.9 120-1.5 180 6.2s120 29.3 180 25.2C780 274 840 244 870 229l30-15v387H0Z"
    />
  </Svg>
);

export default Wave2;