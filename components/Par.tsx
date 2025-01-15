// MySvgComponent.tsx

import React from "react";
import { Text, View } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  Path,
  Stop,
  G,
  SvgProps,
} from "react-native-svg";

type MySvgComponentProps = SvgProps & {
  leftIconHandler?: () => void;
  rightIconHandler?: () => void;
  displayText?: string;
};

const MySvgComponent: React.FC<MySvgComponentProps> = (
  props: MySvgComponentProps
) => {
  return (
    <View
      style={{
        position: "absolute",
        bottom: -30,
      }}
    >
      <Svg
        width={984 * 0.4}
        height={133}
        viewBox="0 0 984 133"
        fill="none"
        {...props}
      >
        <Path
          d="M0.637303 132.46L32.9728 0.492676H55.6823H982.523L950.188 132.46H0.637303Z"
          fill="#185381"
          stroke="#179DF8"
        />

        <G transform="translate(0, 0)" onPress={props.leftIconHandler}>
          <Path
            d="M0.637303 132.52L32.9728 0.552979H55.6823H172.523L140.188 132.52H0.637303Z"
            fill="#185381"
            stroke="#179DF8"
          />
          <Path
            d="M32.6608 15.4436H59.3071H165.882L140.499 117.624H7.27734L32.6608 15.4436Z"
            fill="white"
          />
          <Path
            d="M46.8424 18.1545H150.355L126.317 114.917H22.8047L46.8424 18.1545Z"
            fill="url(#paint0_linear_arrow)"
          />
          <Path
            d="M69.2322 66.8207C68.2559 65.8444 68.2559 64.2615 69.2322 63.2852L85.1421 47.3753C86.1184 46.399 87.7014 46.399 88.6777 47.3753C89.654 48.3516 89.654 49.9345 88.6777 50.9108L74.5355 65.053L88.6777 79.1951C89.654 80.1714 89.654 81.7543 88.6777 82.7306C87.7014 83.707 86.1184 83.707 85.1421 82.7306L69.2322 66.8207ZM107 67.553H71V62.553H107V67.553Z"
            fill="white"
          />
        </G>
        <Text
          style={{
            color: "white",
            fontSize: 40,
            fontWeight: "bold",
            fontStyle: "italic",
            textAlign: "center",
            marginTop: 40,
            marginBottom: 0,
          }}
        >
          {props.displayText}
        </Text>

        <G
          transform="translate(984, 0) scale(-1, 1)"
          onPress={props.rightIconHandler}
        >
          <G transform="scale(-1, 1) translate(-172.523, 0)">
            <Path
              d="M0.637303 132.52L32.9728 0.552979H55.6823H172.523L140.188 132.52H0.637303Z"
              fill="#185381"
              stroke="#179DF8"
            />
            <Path
              d="M32.6608 15.4436H59.3071H165.882L140.499 117.624H7.27734L32.6608 15.4436Z"
              fill="white"
            />
            <Path
              d="M46.8424 18.1545H150.355L126.317 114.917H22.8047L46.8424 18.1545Z"
              fill="url(#paint0_linear_arrow)"
            />
          </G>

          <Path
            d="M69.2322 66.8207C68.2559 65.8444 68.2559 64.2615 69.2322 63.2852L85.1421 47.3753C86.1184 46.399 87.7014 46.399 88.6777 47.3753C89.654 48.3516 89.654 49.9345 88.6777 50.9108L74.5355 65.053L88.6777 79.1951C89.654 80.1714 89.654 81.7543 88.6777 82.7306C87.7014 83.707 86.1184 83.707 85.1421 82.7306L69.2322 66.8207ZM107 67.553H71V62.553H107V67.553Z"
            fill="white"
          />
        </G>

        <Defs>
          <LinearGradient
            id="paint0_linear_arrow"
            x1="22.8047"
            y1="66.536"
            x2="411.146"
            y2="66.536"
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#0B5B91" />
            <Stop offset="0.485" stopColor="#139BF7" />
            <Stop offset="0.95" stopColor="#2DAAFF" />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
};

export default MySvgComponent;
