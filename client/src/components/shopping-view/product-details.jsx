import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";

import { setProductDetails } from "@/store/shop/products-slice";

import { addReview, getReviews } from "@/store/shop/review-slice";

import { useToast } from "../ui/use-toast";
import StarRatingComponent from "../common/star-rating";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");

  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);

  const { toast } = useToast();

  function handleRatingChange(getRating) {
    setRating(getRating);
  }

  function handleAddToCart(getCurrentProductId, getTotalStock) {
    const getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId,
      );

      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;

        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });

          return;
        }
      }
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      }),
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));

        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());

    setRating(0);
    setReviewMsg("");
  }

  async function handleAddReview() {
    try {
      await dispatch(
        addReview({
          productId: productDetails?._id,
          userId: user?.id,
          userName: user?.userName,
          reviewMessage: reviewMsg,
          reviewValue: rating,
        }),
      ).unwrap();

      setRating(0);
      setReviewMsg("");

      dispatch(getReviews(productDetails?._id));

      toast({
        title: "Review added successfully!",
      });
    } catch (error) {
      toast({
        title: error?.message || "Unable to add review",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    if (productDetails !== null) {
      dispatch(getReviews(productDetails?._id));
    }
  }, [productDetails, dispatch]);

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
        reviews.length
      : 0;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent
        className="
          w-[calc(100%-1rem)]
          max-w-[1100px]
          max-h-[95vh]
          overflow-y-auto
          p-4
          sm:p-6
          md:p-8
          lg:p-10
          slick-scrollbar
        "
      >
        <div
          className="
            grid
            grid-cols-1
            gap-6
            md:grid-cols-2
            md:gap-10
          "
        >
          {/* ================= IMAGE ================= */}
          <div
            className="
              w-full
              overflow-hidden
              rounded-xl
              bg-muted
            "
          >
            <img
              src={productDetails?.image}
              alt={productDetails?.title}
              className="
                block
                aspect-square
                w-full
                object-cover
              "
            />
          </div>

          {/* ================= PRODUCT INFO ================= */}
          <div className="flex min-w-0 flex-col">
            {/* Title + Description */}
            <div>
              <h1
                className="
                  text-2xl
                  font-extrabold
                  leading-tight
                  sm:text-3xl
                "
              >
                {productDetails?.title}
              </h1>

              <p
                className="
                  mt-3
                  text-sm
                  leading-6
                  text-muted-foreground
                  sm:text-base
                "
              >
                {productDetails?.description}
              </p>
            </div>

            {/* Price */}
            <div className="mt-5 flex items-center gap-3">
              <p
                className={`
                  text-2xl
                  font-bold
                  text-primary
                  sm:text-3xl
                  ${productDetails?.salePrice > 0 ? "line-through" : ""}
                `}
              >
                ${productDetails?.price}
              </p>

              {productDetails?.salePrice > 0 && (
                <p
                  className="
                    text-xl
                    font-bold
                    text-muted-foreground
                    sm:text-2xl
                  "
                >
                  ${productDetails?.salePrice}
                </p>
              )}
            </div>

            {/* Rating */}
            <div className="mt-3 flex items-center gap-2">
              <StarRatingComponent rating={averageReview} />

              <span className="text-sm text-muted-foreground">
                ({averageReview.toFixed(2)})
              </span>
            </div>

            {/* ================= SIZE ================= */}
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <Label className="text-sm font-semibold">Size</Label>

                <button
                  type="button"
                  className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground"
                >
                  Size guide
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                {productDetails?.variants?.map((variant) => {
                  const isSelected = selectedSize === variant.size;

                  const isOutOfStock = variant.stock === 0;

                  return (
                    <button
                      key={variant.size}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(variant.size)}
                      className={`
            relative
            flex
            h-11
            items-center
            justify-center
            rounded-md
            border
            text-sm
            font-medium
            transition
            ${
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary"
            }
            ${isOutOfStock ? "cursor-not-allowed opacity-40 line-through" : ""}
          `}
                    >
                      {variant.size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add To Cart */}
            <div className="mt-6">
              {productDetails?.totalStock === 0 ? (
                <Button
                  className="
                    h-12
                    w-full
                    cursor-not-allowed
                    opacity-60
                  "
                  disabled
                >
                  Out of Stock
                </Button>
              ) : (
                // <Button
                //   className="
                //     h-12
                //     w-full
                //     text-base
                //   "
                //   onClick={() =>
                //     handleAddToCart(
                //       productDetails?._id,
                //       productDetails?.totalStock,
                //     )
                //   }
                // >
                //   Add to Cart
                // </Button>
                <Button
                  className="h-12 w-full text-base"
                  disabled={!selectedSize}
                  onClick={() =>
                    handleAddToCart(productDetails?._id, selectedSize)
                  }
                >
                  {!selectedSize ? "Select Size" : "Add to Cart"}
                </Button>
              )}
            </div>

            <Separator className="my-6" />

            {/* ================= REVIEWS ================= */}
            <div>
              <h2
                className="
                  mb-4
                  text-lg
                  font-bold
                  sm:text-xl
                "
              >
                Reviews
              </h2>

              <div
                className="
                  max-h-[250px]
                  space-y-5
                  overflow-y-auto
                  pr-2
                  sm:max-h-[300px]
                "
              >
                {reviews && reviews.length > 0 ? (
                  reviews.map((reviewItem) => (
                    <div
                      key={reviewItem._id}
                      className="
                        flex
                        gap-3
                        sm:gap-4
                      "
                    >
                      <Avatar
                        className="
                          h-9
                          w-9
                          shrink-0
                          border
                          sm:h-10
                          sm:w-10
                        "
                      >
                        <AvatarFallback>
                          {reviewItem?.userName?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold">{reviewItem?.userName}</h3>

                        <div className="mt-1">
                          <StarRatingComponent
                            rating={reviewItem?.reviewValue}
                          />
                        </div>

                        <p
                          className="
                            mt-1
                            break-words
                            text-sm
                            leading-5
                            text-muted-foreground
                          "
                        >
                          {reviewItem?.reviewMessage}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No reviews yet.
                  </p>
                )}
              </div>

              {/* ================= WRITE REVIEW ================= */}
              <div className="mt-8 space-y-3">
                <Label>Write a review</Label>

                <div>
                  <StarRatingComponent
                    rating={rating}
                    handleRatingChange={handleRatingChange}
                  />
                </div>

                <Input
                  name="reviewMsg"
                  value={reviewMsg}
                  onChange={(event) => setReviewMsg(event.target.value)}
                  placeholder="Write a review..."
                  className="h-11"
                />

                <Button
                  className="w-full sm:w-auto"
                  onClick={handleAddReview}
                  disabled={reviewMsg.trim() === ""}
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
