import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { useToast } from "@/components/ui/use-toast";
import { addProductFormElements } from "@/config";

import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";

import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const initialFormData = {
  image: null,
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
  averageReview: 0,
  variants: [],
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] =
    useState(false);

  const [formData, setFormData] = useState(initialFormData);

  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);

  const [currentEditedId, setCurrentEditedId] = useState(null);

  const { productList } = useSelector((state) => state.adminProducts);

  const dispatch = useDispatch();
  const { toast } = useToast();

  // ============================================================
  // VARIANT HELPERS
  // ============================================================

  function addVariant() {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        {
          size: "",
          stock: 0,
        },
      ],
    }));
  }

  function updateVariant(index, field, value) {
    setFormData((prev) => {
      const variants = [...(prev.variants || [])];

      variants[index] = {
        ...variants[index],
        [field]: field === "stock" ? Number(value) : value,
      };

      return {
        ...prev,
        variants,
      };
    });
  }

  function removeVariant(index) {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  }

  // ============================================================
  // CALCULATE TOTAL STOCK
  // ============================================================

  const calculatedTotalStock = (formData.variants || []).reduce(
    (total, variant) => total + Number(variant.stock || 0),
    0,
  );

  // ============================================================
  // SUBMIT
  // ============================================================

  function onSubmit(event) {
    event.preventDefault();

    const productData = {
      ...formData,
      image:
        currentEditedId !== null
          ? formData.image || uploadedImageUrl
          : uploadedImageUrl,

      variants: formData.variants || [],

      totalStock: calculatedTotalStock,
    };

    if (currentEditedId !== null) {
      dispatch(
        editProduct({
          id: currentEditedId,
          formData: productData,
        }),
      ).then((data) => {
        console.log(data, "edit");

        if (data?.payload?.success) {
          dispatch(fetchAllProducts());

          resetForm();

          toast({
            title: "Product updated successfully",
          });
        }
      });
    } else {
      dispatch(addNewProduct(productData)).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllProducts());

          resetForm();

          toast({
            title: "Product added successfully",
          });
        }
      });
    }
  }

  // ============================================================
  // DELETE PRODUCT
  // ============================================================

  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());

        toast({
          title: "Product deleted successfully",
        });
      }
    });
  }

  // ============================================================
  // FORM VALIDATION
  // ============================================================

  function isFormValid() {
    const requiredFields = [
      "title",
      "description",
      "category",
      "brand",
      "price",
    ];

    const basicFieldsValid = requiredFields.every(
      (key) =>
        formData[key] !== undefined &&
        formData[key] !== null &&
        formData[key] !== "",
    );

    // Validate variants
    const variantsValid =
      !formData.variants?.length ||
      formData.variants.every(
        (variant) =>
          variant.size !== "" &&
          variant.stock !== "" &&
          Number(variant.stock) >= 0,
      );

    return basicFieldsValid && variantsValid;
  }

  // ============================================================
  // RESET FORM
  // ============================================================

  function resetForm() {
    setOpenCreateProductsDialog(false);
    setCurrentEditedId(null);

    setFormData(initialFormData);

    setImageFile(null);
    setUploadedImageUrl("");
    setImageLoadingState(false);
  }

  // ============================================================
  // FETCH PRODUCTS
  // ============================================================

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Fragment>
      {/* ======================================================
          ADD PRODUCT BUTTON
      ====================================================== */}

      <div className="mb-5 flex w-full justify-end">
        <Button
          onClick={() => {
            setFormData(initialFormData);
            setCurrentEditedId(null);
            setUploadedImageUrl("");
            setOpenCreateProductsDialog(true);
          }}
        >
          Add New Product
        </Button>
      </div>

      {/* ======================================================
          PRODUCT GRID
      ====================================================== */}

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {productList && productList.length > 0
          ? productList.map((productItem) => (
              <AdminProductTile
                key={productItem._id}
                setFormData={setFormData}
                setOpenCreateProductsDialog={setOpenCreateProductsDialog}
                setCurrentEditedId={setCurrentEditedId}
                product={productItem}
                handleDelete={handleDelete}
              />
            ))
          : null}
      </div>

      {/* ======================================================
          PRODUCT SHEET
      ====================================================== */}

      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={(open) => {
          if (!open) {
            resetForm();
          } else {
            setOpenCreateProductsDialog(true);
          }
        }}
      >
        <SheetContent side="right" className="w-full overflow-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>

          {/* ==================================================
              IMAGE UPLOAD
          ================================================== */}

          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={currentEditedId !== null}
          />

          <div className="py-6">
            {/* ==================================================
                BASIC PRODUCT FORM
            ================================================== */}

            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={
                currentEditedId !== null ? "Edit Product" : "Add Product"
              }
              formControls={addProductFormElements}
              isBtnDisabled={!isFormValid() || imageLoadingState}
            />

            {/* ==================================================
                PRODUCT VARIANTS
            ================================================== */}

            <div className="mt-8 border-t pt-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Sizes & Stock</h3>

                  <p className="text-sm text-muted-foreground">
                    Add available shoe sizes and their stock levels.
                  </p>
                </div>

                <Button type="button" variant="outline" onClick={addVariant}>
                  + Add Size
                </Button>
              </div>

              {/* ==================================================
                  VARIANT LIST
              ================================================== */}

              <div className="space-y-3">
                {formData.variants?.map((variant, index) => (
                  <div
                    key={index}
                    className="flex items-end gap-3 rounded-lg border p-3"
                  >
                    {/* SIZE */}

                    <div className="flex-1">
                      <label className="mb-1 block text-sm font-medium">
                        Size
                      </label>

                      <input
                        type="text"
                        value={variant.size}
                        placeholder="e.g. 8"
                        onChange={(event) =>
                          updateVariant(index, "size", event.target.value)
                        }
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
                      />
                    </div>

                    {/* STOCK */}

                    <div className="flex-1">
                      <label className="mb-1 block text-sm font-medium">
                        Stock
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={variant.stock}
                        placeholder="0"
                        onChange={(event) =>
                          updateVariant(index, "stock", event.target.value)
                        }
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
                      />
                    </div>

                    {/* REMOVE */}

                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeVariant(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}

                {/* EMPTY STATE */}

                {!formData.variants?.length && (
                  <div className="rounded-lg border border-dashed p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      No sizes added yet.
                    </p>

                    <Button
                      type="button"
                      variant="outline"
                      className="mt-3"
                      onClick={addVariant}
                    >
                      Add First Size
                    </Button>
                  </div>
                )}
              </div>

              {/* ==================================================
                  TOTAL STOCK
              ================================================== */}

              <div className="mt-4 flex items-center justify-between rounded-lg bg-muted p-4">
                <span className="text-sm font-medium">Total Stock</span>

                <span className="text-lg font-bold">
                  {calculatedTotalStock}
                </span>
              </div>
            </div>

            {/* ==================================================
                SUBMIT BUTTON
            ================================================== */}

            <div className="mt-6">
              <Button
                type="button"
                className="w-full"
                disabled={!isFormValid() || imageLoadingState}
                onClick={onSubmit}
              >
                {currentEditedId !== null ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
