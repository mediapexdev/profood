import { CategoryProps } from "../../components/categories/Category";

/**
 * Define the type for the selected category context
 */
export type SelectedCategoryContextType = {
    selectedCategory?: CategoryProps;
    changeSelectedCategory: (category?: CategoryProps) => void;
};
