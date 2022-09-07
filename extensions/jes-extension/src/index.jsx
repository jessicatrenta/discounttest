import React, { useEffect, useState } from "react";
import {
  render,
  Divider,
  Image,
  Banner,
  Heading,
  Button,
  InlineLayout,
  BlockStack,
  Text,
  SkeletonText,
  SkeletonImage,
  useCartLines,
  useApplyAttributeChange,
  useApplyCartLinesChange,
  useAttributes,
  useAppMetafields,
  useApplyMetafieldsChange,
  useSettings,
  useExtensionApi,
} from "@shopify/checkout-ui-extensions-react";

const PRODUCT_VARIANTS_DATA = [
  {
    id: "gid://shopify/ProductVariant/43575520952562",
    img: "https://via.placeholder.com/100/F1F1F1?text=P1",
    title: "Product 1 Title",
    price: 10.0,
  },
];

// Set the entry points for the extension
render("Checkout::Dynamic::Render", () => <App />);
render("Checkout::DeliveryAddress::RenderBefore", () => <App />);

function App() {
  const applyAttributeChange = useApplyAttributeChange();

  const { i18n } = useExtensionApi();
  const applyCartLinesChange = useApplyCartLinesChange();
  const getAttributes = useAttributes();
  const myId = 'gid://shopify/ProductVariant/43575520952562';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showError, setShowError] = useState(false);
  const [apiResponse, setApiResponse] = useState();

  const callFunction = async () => {
    // setLoading(true);
    console.log("callFunction");
    try {
      const response = await fetch("https://httpbin.org/ip", {
        mode: "cors",
        credentials: "same-origin",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Bypass-Tunnel-Reminder": "true",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("RESPONSE IS ", data);
          try {
            applyAttributeChange({
              key: "volume_code",
              type: "updateAttribute",
              value: "50",
            })
              .then((data) => {
                console.log("ATTRIBUTES", data);
              })
              .then((attributes) => {
                const atttt = getAttributes;
                console.log("GET ATTRIBUTES", atttt);
                console.log("APPLY PROD TO CARD ", id);
                addProduct();
              });
          } catch (e) {
            console.log("ERROR IN useApplyAttributeChange", e);
          }
        });
    } catch (error) {
      // setIp('NADA')
      console.log("ERROR", error);
    }
  };

  const addProduct = async () => {
    const result = await applyCartLinesChange({
      type: "addCartLine",
      merchandiseId: id,
      quantity: 1,
    });
    setAdding(false);
    if (result.type === "error") {
      // An error occurred adding the cart line
      // Verify that you're using a valid product variant ID
      // For example, 'gid://shopify/ProductVariant/123'
      setShowError(true);
      console.error(result.message);
    }
  };

  const testApplyLavaDiscount = async () => {
    console.log('testApplyLavaDiscount');
    try {
      // call LAVA API 
      await fetch("https://httpbin.org/ip", {
        mode: "cors",
        credentials: "same-origin",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Bypass-Tunnel-Reminder": "true",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // insert mocked data here
          data = data // add your object here
          console.log(" LAVA RESPONSE IS ", data);
          try {
            /* applyAttributeChange sets an arbitrary attribute to the cart
              insert attribute field in input.graphql and in api.rs as optional
             */
            applyAttributeChange({
              key: "volume_code",
              type: "updateAttribute",
              value: "50",
            })
              .then( async () => {
                // check if the new attribute has been applied
                const newAttribute = getAttributes;
                console.log("GET NEW ATTRIBUTES", newAttribute);
                // since the applyAttributeChange does not trigger the discount functions to be re-executed
                // we need to use applyCartLinesChange to update the cart
                // since we only have to trigger the discount function without adding any product
                // we set quantity to 0
                await applyCartLinesChange({
                  type: "addCartLine",
                  merchandiseId: myId,
                  quantity: 0,
                }).then((applyCartLinesChangeResponse) => console.log("applyCartLinesChangeResponse", applyCartLinesChangeResponse))
                .catch((applyCartLinesChangeError) => console.error("applyCartLinesChangeError", applyCartLinesChangeError));
              });
          } catch (e) {
            console.log("ERROR IN applyAttributeChange", e);
          }
        });
    } catch (error) {
      console.log("API CALL ERROR", error);
    }



    
    
  };

  useEffect(() => {
    // Set the loading state to show some UI if you're waiting
    setLoading(true);
    // If you're making a network request, then replace the following code with the HTTP call
    // If you don't need to make a network request, then you can remove this `useEffect`
    testApplyLavaDiscount()
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(PRODUCT_VARIANTS_DATA);
      }, 800);
    })
      .then((result) => {
        // Set the "products" array so that you can reference the array items
        setProducts(result);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  // If an offer is added and an error occurs, then show some error feedback using a banner
  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  // Access the current cart lines and subscribe to changes
  const lines = useCartLines();
  console.log("LINES", lines);

  // Show a loading UI if you're waiting for product variant data
  // Use Skeleton components to keep placement from shifting when content loads
  if (loading) {
    return (
      <BlockStack spacing="loose">
        <Divider />
        <Heading level={2}>You might also like</Heading>
        <BlockStack spacing="loose">
          <InlineLayout
            spacing="base"
            columns={[64, "fill", "auto"]}
            blockAlignment="center"
          >
            <SkeletonImage aspectRatio={1} />
            <BlockStack spacing="none">
              <SkeletonText inlineSize="large" />
              <SkeletonText inlineSize="small" />
            </BlockStack>
            <Button kind="secondary" disabled={true}>
              Add
            </Button>
          </InlineLayout>
        </BlockStack>
      </BlockStack>
    );
  }
  // If product variants can't be loaded, then show nothing
  if (!loading && products.length === 0) {
    return null;
  }

  // Filter out any product variants on offer that are already current cart lines
  const productsOnOffer = products.filter(
    (product) => !lines.map((item) => item.merchandise.id).includes(product.id)
  );
  // Choose the first available product variant on offer or display the default fallback product variant
  const { id, img, title, price } = productsOnOffer[0] || products[0];
  // Localize the currency for international merchants and customers
  const renderPrice = i18n.formatCurrency(price);

  // Set a default status for the banner if a merchant didn't configure the banner in the checkout editor
  // const {getSessionToken} = useSessionToken();

  // Render the banner
  return (
    <>
      <Banner title={"BANNER TITLE"}>
        RESPONSE FROM API CALL:: {apiResponse}
      </Banner>
      <BlockStack spacing="loose">
        <Divider />
        <Heading level={2}>You might also like</Heading>
        <BlockStack spacing="loose">
          <InlineLayout
            spacing="base"
            // Use the `columns` property to set the width of the columns
            // Image: column should be 64px wide
            // BlockStack: column, which contains the title and price, should "fill" all available space
            // Button: column should "auto" size based on the intrinsic width of the elements
            columns={[64, "fill", "auto"]}
            blockAlignment="center"
          >
            <Image
              border="base"
              borderWidth="base"
              borderRadius="loose"
              source={img}
              description={title}
              aspectRatio={1}
            />
            <BlockStack spacing="none">
              <Text size="medium" emphasis="strong">
                {title}
              </Text>
              <Text appearance="subdued">{renderPrice}</Text>
            </BlockStack>
            <Button
              kind="secondary"
              loading={adding}
              accessibilityLabel={`Add ${title} to cart`}
              onPress={async () => {
                callFunction();
                // setAdding(true);
                // Apply the cart lines change
              }}
            >
              Add
            </Button>
            <Button
              kind="primary"
              loading={adding}
              accessibilityLabel={`testApplyLavaDiscount`}
              onPress={() => {
                testApplyLavaDiscount();
              }}
            >
              testApplyLavaDiscount
            </Button>
          </InlineLayout>
        </BlockStack>
        {showError && (
          <Banner status="critical">
            There was an issue adding this product. Please try again.
          </Banner>
        )}
      </BlockStack>
    </>
  );
}
