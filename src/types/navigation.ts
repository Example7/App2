import { Product } from "./models";

export type RootStackParamList = {
  AppTabs: undefined;
  ProductDetails: { product: Product };
  Login: undefined;
  Register: undefined;
};
