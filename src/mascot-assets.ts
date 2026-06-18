import type { ImageSourcePropType } from "react-native";

declare const require: (path: string) => ImageSourcePropType;

export type CatMascotMood = "search" | "wave" | "boxLove" | "clipboard" | "alert" | "boxWarning";

export const catMascotImages: Record<CatMascotMood, ImageSourcePropType> = {
  alert: require("../assets/mascot/cat-alert.png"),
  boxLove: require("../assets/mascot/cat-box-love.png"),
  boxWarning: require("../assets/mascot/cat-box-warning.png"),
  clipboard: require("../assets/mascot/cat-clipboard.png"),
  search: require("../assets/mascot/cat-search.png"),
  wave: require("../assets/mascot/cat-wave.png"),
};
