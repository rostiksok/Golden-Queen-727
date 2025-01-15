import React from "react";
import Svg, {
  Path,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";

interface ParallelogramProps {
  width?: number;
  height?: number;
  text?: string | number;
  isActive?: boolean; // Вказує, чи це поточне питання
  isAnswered?: boolean; // Вказує, чи вже є відповідь
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  textSize?: number; // Додана пропертя для розміру тексту
}

const Parallelogram: React.FC<ParallelogramProps> = ({
  width = 200,
  height = 100,
  text,
  isActive = false,
  isAnswered = false,
  borderColor = "white",
  textSize = 65,
}) => {
  const backgroundColor = isActive
    ? "url(#activeGradient)"
    : isAnswered
    ? "url(#answeredGradient)"
    : "#FFFFFF";

  return (
    <Svg width={width + 50} height={height} viewBox="0 0 150 100" fill="none">
      <Defs>
        {/* Градієнт для активного питання */}
        <LinearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#0B5B91" />
          <Stop offset="50%" stopColor="#139BF7" />
          <Stop offset="100%" stopColor="#2DAAFF" />
        </LinearGradient>

        {/* Градієнт для відповіді, яка вже дана */}
        <LinearGradient
          id="answeredGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <Stop offset="0%" stopColor="#ABABAB" />
          <Stop offset="100%" stopColor="#5D5D5D" />
        </LinearGradient>
      </Defs>

      {/* Основний паралелограм */}
      <Path
        d="M20.4602 0H130.567L110.1069 100H0L20.4602 0Z"
        fill={backgroundColor}
        stroke={borderColor}
      />

      {/* Текст всередині */}
      {text && (
        <SvgText
          x="60"
          y="55"
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize={textSize}
          fill={isAnswered || isActive ? "white" : "#3498db"}
          fontWeight="700"
          fontStyle="italic"
        >
          {text}
        </SvgText>
      )}
    </Svg>
  );
};

export default Parallelogram;
