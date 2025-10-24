import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { validateProductFields } from "./productsTransaction.validation";
import IndividualUser from "../../authentication/individualUserAuth/individualUserAuth.model1";
import { errorHandler } from "../../../middlewares/errorHandling.middleware";

import ProductTransaction from "./productsTransaction.model";
import {
  paymentForEscrowProductTransaction,
  verifyPaymentForEscrowProductTransaction,
} from "./productsTransaction.paystack";
import {
  sendEscrowInitiationEmailToInitiator,
  sendEscrowInitiationEmailToVendor,
  sendShippingDetailsEmailToInitiator,
  sendShippingDetailsEmailToVendor,
  sendSuccessfulEscrowEmailToInitiator,
  sendSuccessfulEscrowEmailToVendor,
} from "./productTransaction.mail";
import ShippingDetails from "./shippingDetails.model";
import ProductDispute from "../../disputes/productsDispute/productDispute.model";

// export const initiateEscrowProductTransaction = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const {
//     // transaction_id,
//     vendor_name,
//     vendor_phone_number,
//     buyer_email, // get it from the frontend
//     vendor_email,
//     transaction_type,
//     product_name,
//     // product_category,
//     product_quantity,
//     product_price,
//     transaction_total,
//     product_image,
//     product_description,
//     signed_escrow_doc,
//     delivery_address,
//     // transaction_status,
//     // payment_status,
//     // profit_made,
//   } = req.body;

//   // Validate required fields
//   validateProductFields(
//     {
//       // transaction_id,
//       vendor_name,
//       vendor_phone_number,
//       // buyer_email,
//       vendor_email,
//       transaction_type,
//       product_name,
//       // product_category,
//       product_quantity,
//       product_price,
//       transaction_total,
//       product_image,
//       product_description,
//       // signed_escrow_doc,
//       delivery_address,
//       // transaction_status,
//       // payment_status,
//       // profit_made,
//     },
//     next
//   );

//   try {
//     // Find the user who initiated the transaction
//     // const user = req.user;
//     const user = await IndividualUser.findOne({ email: buyer_email }); //

//     // check if buyer email and vendor email is the same: if it is, we want to tell them that they can't sell to themselves if not we proceed

//     // console.log("user", user);

//     // WE ARE GOING TO USE THIS LOGIC AS A PERSON CANNOT INITIATE ESCROW WITH THEMSELVES
//     // if (!user) {
//     //   return next(errorHandler(404, "User not found"));
//     // } else if (buyer_email === vendor_email) {
//     //   return next(
//     //     errorHandler(404, "You cannot initiate an escrow with yourself")
//     //   );
//     // } else {
//     //   // buyer pays for the escrow
//     //   const transaction_id: string = await uuidv4(); // Generate a random UUID
//     //   // console.log(transaction_id);

//     //   const data = {
//     //     reference: transaction_id,
//     //     amount: transaction_total,
//     //     email: buyer_email,
//     //   };

//     //   // console.log("trans_id_b4_pay", data?.reference);

//     //   const buyerPaysForEscrow = await paymentForEscrowProductTransaction(data);

//     //   // console.log(buyerPaysForEscrow);

//     //   // details are saved in the db

//     //   const newTransaction = new Product({
//     //     user: user,
//     //     transaction_id,
//     //     vendor_name,
//     //     vendor_phone_number,
//     //     buyer_email,
//     //     vendor_email,
//     //     transaction_type,
//     //     product_name,
//     //     // product_category,
//     //     product_quantity,
//     //     product_price,
//     //     transaction_total,
//     //     product_image,
//     //     product_description,
//     //     signed_escrow_doc,
//     //     delivery_address,
//     //     // transaction_status,
//     //     // verified_payment_status: false,
//     //     // profit_made,
//     //     // user: user?.email,
//     //   });

//     //   await newTransaction.save();

//     //   // send response
//     //   res.json({
//     //     buyerPaysForEscrow,
//     //     status: "success",
//     //     message:
//     //       "You have successfully initiated an escrow, please proceed to make payment.",
//     //   });
//     // }

//     if (!user) {
//       return next(errorHandler(404, "User not found"));
//     } else if (buyer_email === vendor_email) {
//       return next(
//         errorHandler(404, "You cannot initiate an escrow with yourself")
//       );
//     } else {
//       // buyer pays for the escrow
//       const transaction_id: string = await uuidv4(); // Generate a random UUID
//       // console.log(transaction_id);

//       const data = {
//         reference: transaction_id,
//         amount: transaction_total,
//         email: buyer_email,
//       };

//       // console.log("trans_id_b4_pay", data?.reference);

//       const buyerPaysForEscrow = await paymentForEscrowProductTransaction(data);

//       // console.log(buyerPaysForEscrow);

//       // details are saved in the db

//       const newTransaction = new productTransaction({
//         user: user,
//         transaction_id,
//         vendor_name,
//         vendor_phone_number,
//         buyer_email,
//         vendor_email,
//         transaction_type,
//         product_name,
//         // product_category,
//         product_quantity,
//         product_price,
//         transaction_total,
//         product_image,
//         product_description,
//         signed_escrow_doc,
//         delivery_address,
//         // transaction_status,
//         // verified_payment_status: false,
//         // profit_made,
//         // user: user?.email,
//       });

//       await newTransaction.save();

//       // send response
//       res.json({
//         buyerPaysForEscrow,
//         status: "success",
//         message:
//           "You have successfully initiated an escrow, please proceed to make payment.",
//       });
//     }
//   } catch (error: string | unknown) {
//     console.log(error);
//     // return next(errorHandler(500, "server error"));
//     return next(errorHandler(500, "server error"));
//   }
// };

export const initiateEscrowProductTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    vendor_name,
    vendor_phone_number,
    buyer_email,
    vendor_email,
    transaction_type,
    products,
    signed_escrow_doc,
    delivery_address,
  } = req.body;

  validateProductFields(
    {
      vendor_name,
      vendor_phone_number,
      vendor_email,
      transaction_type,
      products,
      delivery_address,
    },
    next
  );

  try {
    const user = await IndividualUser.findOne({ email: buyer_email });

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    if (buyer_email === vendor_email) {
      return next(
        errorHandler(404, "You cannot initiate an escrow with yourself")
      );
    }

    const transaction_id = uuidv4();
    const sum_total = products.reduce(
      (sum: number, p: { price: number; quantity: number }) =>
        sum + p.price * p.quantity,
      0
    );
    const commission = sum_total * 0.01; // 1% commission
    const transaction_total = sum_total + commission; // Sum total plus 1% commission

    const newTransaction = new ProductTransaction({
      user,
      transaction_id,
      vendor_name,
      vendor_phone_number,
      buyer_email,
      vendor_email,
      transaction_type,
      products,
      sum_total,
      transaction_total,
      signed_escrow_doc,
      delivery_address,
      buyer_initiated: true,
    });

    await newTransaction.save();
    await sendEscrowInitiationEmailToVendor(
      transaction_id,
      vendor_name,
      vendor_email,
      products,
      sum_total,
      transaction_total
    );

    res.json({
      status: "success",
      message: "Transaction initiated, awaiting seller confirmation.",
      transaction_id,
      sum_total,
      transaction_total,
      commission, // Optionally include commission for transparency
    });
  } catch (error) {
    return next(errorHandler(500, "server error"));
  }
};

// export const sellerConfirmsAnEscrowProductTransaction = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   // when the mail link is clicked
//   // we need to check if they have an account, if they do,
//   // we redirect them to login if they weren't previously logged in and lead them straight to the page to confirm escrow
//   // we need to check if they have an account, if they don't,
//   // they are redirected to a signup
//   // they signup and are redirected to the page for confirming the escrow
//   // when they accept/confirm, a message/popup to tell the seller the next steps.
//   // mail is sent to the buyer that the seller has agreed and will be sending the goods
//   // the mail contains a link to the page where the buyer can click on so that they are redirected to where they can confirm that they like the product and close the escrow.

//   const { transaction_id } = req.body;

//   try {
//     // const user = res?.locals?.user;

//     // if (!user) {
//     //   // res.json({
//     //   //   status: "error",
//     //   //   message: "all transactions fetched successfully",
//     //   //   signup_link: `${process.env.LOCAL_FRONTEND_BASE_URL}/signup`,
//     //   // });

//     //   // res.status(401).json({
//     //   //   status: "error",
//     //   //   message: "Unauthorized. Please log in to confirm the escrow transaction.",
//     //   //   login_link: `/login?redirect=/confirm-escrow/${transaction_id}`,
//     //   // });

//     //   res.status(401).json({
//     //     status: "error",
//     //     message: "Unauthorized. Please log in to confirm the escrow transaction.",
//     //     login_link: `${process.env.LOCAL_FRONTEND_BASE_URL}/login?redirect=/confirm-escrow/${transaction_id}`,
//     //   });
//     // }

//     const transaction = await productTransaction.findOne({
//       transaction_id: transaction_id,
//       // user_id: user?._id,
//     });

//     const transactionWithConfirmationStatus = await productTransaction.findOne({
//       transaction_id: transaction_id,
//       seller_confirm_status: false,
//       // user_id: user?._id,
//     });

//     // if (!transaction) {
//     //   return next(errorHandler(404, "Transaction not found."));
//     // }

//     const transactionId = transaction?.transaction_id;
//     const sellerConfirmStatus =
//       transactionWithConfirmationStatus?.seller_confirm_status;

//     // if transactionId !== transaction_id from req.body: invalid transaction
//     // if transactionId === transaction_id && seller_confirm_status === true: this transaction has been confirmed
//     // else: continue with the logic

//     if (transactionId !== transaction_id) {
//       return next(errorHandler(404, "Invalid transaction."));
//     } else if (sellerConfirmStatus !== false) {
//       return next(errorHandler(404, "This transaction has been confirmed."));
//     } else {
//       const vendor_email = transaction?.vendor_email;

//       console.log("vendor_email", vendor_email);

//       const checkIfUserExists = await IndividualUser.findOne({
//         email: vendor_email,
//       });

//       // const user = res.locals.user;

//       if (!checkIfUserExists) {
//         return res.status(401).json({
//           status: "error",
//           message:
//             "You do not have an account, please proceed to the signup page to create an account.",
//           // signup_link: `${process.env.LOCAL_FRONTEND_BASE_URL}/signup?redirect=/confirm-escrow/${transaction_id}`,
//           // signup_link: `${process.env.LOCAL_FRONTEND_BASE_URL}/signup`,
//         });
//       }

//       // THIS MAIL SENDS EVEN THOUGH THE PERSON IS VERIFIED. LOGIN ALREADY TAKES CARE OF THIS
//       // if (!checkIfUserExists?.email_verified) {
//       //   const verificationToken = jwt.sign(
//       //     { vendor_email },
//       //     process.env.JWT_SECRET as string,
//       //     { expiresIn: 60 * 60 }
//       //   );
//       //   await sendVerificationEmail(vendor_email, verificationToken);
//       //   return res.status(200).json({
//       //     status: "false",
//       //     message:
//       //       "Account is unverified! Verfication email sent. verify account to continue",
//       //   });
//       // }

//       // if (checkIfUserExists) {
//       //   res.status(401).json({
//       //     status: "error",
//       //     message:
//       //       "You do not have an account, please proceed to the signup page to create an account.",
//       //     // signup_link: `${process.env.LOCAL_FRONTEND_BASE_URL}/signup?redirect=/confirm-escrow/${transaction_id}`,
//       //     signup_link: `${process.env.LOCAL_FRONTEND_BASE_URL}/signup`,
//       //   });
//       // }

//       return res.json({
//         transaction,
//         status: "success",
//         message: "transaction fetched successfully",
//       });
//     }

//     // we need to fetch the details from the product document probably by hitting the getbytransactionid endpoint
//   } catch (error) {
//     res.status(500).json({ message: "Error Logging in user", error });
//   }
// };
export const sellerConfirmsAnEscrowProductTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { transaction_id, confirmation, vendor_email } = req.body;

  // Validate required fields
  if (!transaction_id || typeof confirmation !== "boolean" || !vendor_email) {
    return next(
      errorHandler(
        400,
        "Transaction ID, confirmation, and vendor email are required"
      )
    );
  }

  try {
    const transaction = await ProductTransaction.findOne({ transaction_id });

    if (!transaction) {
      return next(errorHandler(404, "Transaction not found"));
    }

    // Check if the transaction is in a valid state for confirmation
    if (!transaction.buyer_initiated || transaction.seller_confirmed) {
      return next(
        errorHandler(400, "Invalid transaction state for confirmation")
      );
    }

    // Verify the vendor email matches the transaction's vendor_email
    if (transaction.vendor_email !== vendor_email) {
      return next(errorHandler(403, "Unauthorized: Incorrect vendor email"));
    }

    if (confirmation) {
      const updatedTransaction = await ProductTransaction.findByIdAndUpdate(
        transaction._id,
        {
          seller_confirmed: true,
          transaction_status: "awaiting_payment",
        },
        { new: true }
      );

      if (!updatedTransaction) {
        return next(errorHandler(500, "Failed to update transaction"));
      }

      // Updated call with all required parameters and 'accepted' status
      await sendEscrowInitiationEmailToInitiator(
        transaction.buyer_email,
        transaction.transaction_id,
        transaction.transaction_total,
        transaction.vendor_name,
        transaction.products,
        transaction.sum_total,
        "accepted"
      );

      res.json({
        status: "success",
        message: "Seller confirmed, buyer notified to proceed with payment.",
        transaction_id: updatedTransaction.transaction_id,
      });
    } else {
      const updatedTransaction = await ProductTransaction.findByIdAndUpdate(
        transaction._id,
        {
          seller_confirmed: false,
          transaction_status: "declined",
        },
        { new: true }
      );

      if (!updatedTransaction) {
        return next(errorHandler(500, "Failed to update transaction"));
      }

      // Updated call with all required parameters and 'rejected' status
      await sendEscrowInitiationEmailToInitiator(
        transaction.buyer_email,
        transaction.transaction_id,
        transaction.transaction_total,
        transaction.vendor_name,
        transaction.products,
        transaction.sum_total,
        "rejected"
      );

      res.json({
        status: "success",
        message: "Seller declined the transaction.",
        transaction_id: updatedTransaction.transaction_id,
      });
    }
  } catch (error) {
    return next(errorHandler(500, "Server error"));
  }
};

//  export const verifyEscrowProductTransactionPayment = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { reference } = req.body;

//     console.log("reference", reference);

//     const transaction = await productTransaction.findOne({
//       transaction_id: reference,
//       verified_payment_status: false,
//     });
//     // console.log("transaction_id", transaction?.transaction_id);

//     if (!transaction) {
//       return next(
//         errorHandler(
//           404,
//           "transaction not found or your transaction has been verified"
//         )
//       );
//     } else {
//       await verifyPaymentForEscrowProductTransaction(reference);

//       // console.log(verifyTransaction);
//       // console.log(reference);

//       // console.log("trans_1", transaction);

//       // await Product.updateOne({
//       //   transaction_id: reference,
//       //   // transaction_status: true,
//       //   verified_payment_status: true,
//       // });

//       // const newTerr = await Product.findOneAndUpdate(
//       //   { _id: transaction?._id },
//       //   // {
//       //   //   transaction_id: reference,
//       //   // }
//       //   {
//       //     verified_payment_status: true,
//       //   },
//       //   { new: true }
//       // );

//       // if (transaction?.verified_payment_status === false) {
//       //   return next(
//       //     errorHandler(401, "this transaction has not been successful")
//       //   );
//       // } else {
//       // console.log("newTerr", newTerr);

//       // THIS IS WHEN WE SEND THE MESSAGES, NOT DURING INITIATION

//       // pull out the content of the product table for mail delivery

//       const {
//         buyer_email,
//         transaction_id,
//         vendor_name,
//         vendor_email,
//         product_name,
//         product_price,
//         transaction_total,
//       } = transaction;

//       // console.log(transaction);

//       // const findProductDetails = await Product.findOne({
//       //   email: buyer_email,
//       // });

//       // const buyer_email =

//       // Send email to the initiator
//       await sendEscrowInitiationEmailToInitiator(
//         buyer_email,
//         transaction_id,
//         transaction_total
//       );

//       // await sendEscrowInitiationEmail(user?.email, transaction_id);

//       // Send email to the vendor
//       await sendEscrowInitiationEmailToVendor(
//         transaction_id,
//         vendor_name,
//         vendor_email,
//         product_name,
//         product_price
//       );

//       // send response
//       res.json({
//         status: "success",
//         message: "Payment has been successfully verified.",
//       });
//       // }
//     }
//   } catch (error: string | unknown) {
//     console.log(error);
//     // return next(errorHandler(500, "server error"));
//     return next(errorHandler(500, "server error"));
//   }
// };

export const verifyEscrowProductTransactionPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { transaction_id, buyer_email, reference } = req.body;

  if (!transaction_id || !buyer_email) {
    return next(
      errorHandler(400, "Transaction ID and buyer email are required")
    );
  }

  try {
    const transaction = await ProductTransaction.findOne({ transaction_id });

    if (!transaction) return next(errorHandler(404, "Transaction not found"));

    if (
      !transaction.buyer_initiated ||
      !transaction.seller_confirmed ||
      transaction.verified_payment_status
    ) {
      return next(
        errorHandler(400, "Invalid transaction state for payment verification")
      );
    }

    if (transaction.buyer_email !== buyer_email) {
      return next(errorHandler(403, "Unauthorized: Incorrect buyer email"));
    }

    // STEP 1: INITIATE PAYMENT
    if (!reference) {
      const paystackResponse = await paymentForEscrowProductTransaction({
        reference: transaction.transaction_id,
        amount: Number(transaction.transaction_total),
        email: buyer_email,
      });

      if (paystackResponse.status && paystackResponse.data.authorization_url) {
        return res.json({
          status: "success",
          message:
            "Payment initiation successful. Please complete the payment on Paystack.",
          authorization_url: paystackResponse.data.authorization_url,
          transaction_id: transaction.transaction_id,
        });
      }

      return next(errorHandler(500, "Failed to initiate Paystack payment"));
    }

    // STEP 2: VERIFY PAYMENT
    const verificationResponse = await verifyPaymentForEscrowProductTransaction(
      reference
    );

    if (
      verificationResponse.status &&
      verificationResponse.data.status === "success" &&
      verificationResponse.data.amount / 100 ===
        Number(transaction.transaction_total)
    ) {
      const updatedTransaction = await ProductTransaction.findByIdAndUpdate(
        transaction._id,
        {
          verified_payment_status: true,
          transaction_status: "awaiting_shipping",
        },
        { new: true }
      );

      if (!updatedTransaction)
        return next(errorHandler(500, "Failed to update transaction"));

      try {
        await sendEscrowInitiationEmailToVendor(
          transaction.transaction_id,
          transaction.vendor_name,
          transaction.vendor_email,
          transaction.products,
          transaction.sum_total,
          transaction.transaction_total
        );
      } catch (err) {
        console.error("Failed to send vendor email:", err);
      }

      return res.json({
        status: "success",
        message: "Payment has been successfully verified.",
        sum_total: transaction.sum_total,
        transaction_total: transaction.transaction_total,
        transaction_id: updatedTransaction.transaction_id,
      });
    }

    return next(errorHandler(400, "Payment verification failed"));
  } catch (error) {
    console.error("verifyEscrowProductTransactionPayment error:", error);
    return next(errorHandler(500, "Server error"));
  }
};

//  export const sellerFillOutShippingDetails = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   // when they accept/confirm, a message/popup to tell the seller the next steps.
//   // mail is sent to the buyer that the seller has agreed and will be sending the goods
//   // the mail contains a link to the page where the buyer can click on so that they are redirected to where they can confirm that they like the product and close the escrow.

//   // when vendor clicks on agree, they are redirected to a form to fill in the shipping details -> a summary is given and is contained in the mail sent to the buyer

//   // when vendor agrees, the buyer and seller get a mail

//   const {
//     shipping_company,
//     delivery_person_name,
//     delivery_person_number,
//     delivery_person_email,
//     delivery_date,
//     pick_up_address,
//     transaction_id,
//   } = req.body;

//   try {
//     validateProductFields(
//       {
//         shipping_company,
//         delivery_person_name,
//         delivery_person_number,
//         delivery_person_email,
//         delivery_date,
//         pick_up_address,
//       },
//       next
//     );

//     const getTransaction = await productTransaction.findOne({
//       transaction_id: transaction_id,
//       seller_confirm_status: false,
//     });

//     const transactionId = getTransaction?.transaction_id;
//     const sellerConfirmStatus = getTransaction?.seller_confirm_status;
//     const buyer_email = getTransaction?.buyer_email;
//     const vendor_name = getTransaction?.vendor_name;
//     const vendor_email = getTransaction?.vendor_email;
//     const product_name = getTransaction?.product_name;

//     console.log("Buyer Email 1:", buyer_email);
//     console.log("Vendor Email 1:", vendor_email);

//     // if (!transactionId || !vendorName || !vendorEmail || !productName) {
//     //   console.log("Error: Missing required fields to send the email");
//     //   return; // Exit the function early or handle the error
//     // }

//     const user = await IndividualUser.findOne({
//       email: vendor_email,
//     });

//     if (transactionId !== transaction_id && sellerConfirmStatus !== false) {
//       return next(
//         errorHandler(404, "This Transaction has been previously confirmed.")
//       );
//     } else {
//       const newShippingDetails = new ShippingDetails({
//         user: user,
//         product: getTransaction,
//         transaction_id: transactionId,
//         shipping_company,
//         delivery_person_name,
//         delivery_person_number,
//         delivery_person_email,
//         delivery_date,
//         pick_up_address,
//         buyer_email,
//         vendor_email,
//       });

//       console.log("Buyer Email 2:", buyer_email);
//       console.log("Vendor Email 2:", vendor_email);

//       await newShippingDetails.save();

//       // THE seller_confirm_status WILL BE UPDATED TO TRUE AFTER IT HAS BEEN SAVED SO THAT USERS CANNOT RECONFIRM IT
//       const updatedConfirmationStatus =
//         await productTransaction.findOneAndUpdate(
//           { _id: getTransaction?._id },
//           {
//             seller_confirm_status: true,
//           },
//           { new: true }
//         );

//       console.log("updatedConfirmationStatus", updatedConfirmationStatus);

//       // WE CANNOT SEND SHIPPING DETAILS TWICE
//       // send mail to initiator with shipping details
//       await sendShippingDetailsEmailToInitiator(
//         buyer_email,
//         shipping_company,
//         delivery_person_name,
//         delivery_person_number,
//         delivery_date,
//         pick_up_address
//       );

//       // send mail to seller about waiting for delivery to get to buyer
//       await sendShippingDetailsEmailToVendor(
//         transactionId,
//         vendor_name,
//         vendor_email,
//         product_name
//       );

//       console.log("Buyer Email Last:", buyer_email);
//       console.log("Vendor Email Last:", vendor_email);

//       res.json({
//         newShippingDetails,
//         status: "success",
//         message: "you have successfully started an order",
//       });
//     }

//     // check if the transaction id exist
//     // extract the transaction_id and pass it in to save
//     // send mail to both users
//   } catch (error) {
//     res.status(500).json({ message: "Error Logging in user", error });
//   }
// };

export const sellerFillOutShippingDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const {
    shipping_company,
    delivery_person_name,
    delivery_person_number,
    delivery_person_email,
    delivery_date,
    pick_up_address,
    transaction_id,
  } = req.body;

  // Validate input fields
  validateProductFields(
    {
      shipping_company,
      delivery_person_name,
      delivery_person_number,
      delivery_person_email,
      delivery_date,
      pick_up_address,
    },
    next
  );

  try {
    // Ensure transaction exists and is in correct state
    const transaction = await ProductTransaction.findOne({
      transaction_id,
      verified_payment_status: true,
      shipping_submitted: false,
    });

    if (!transaction) {
      return next(errorHandler(404, "Invalid transaction state for shipping"));
    }

    // Get vendor user info
    const user = await IndividualUser.findOne({
      email: transaction.vendor_email,
    });

    if (!user) {
      return next(errorHandler(404, "Vendor not found"));
    }

    //Create shipping record
    const newShippingDetails = new ShippingDetails({
      user,
      product: transaction,
      transaction_id,
      shipping_company,
      delivery_person_name,
      delivery_person_number,
      delivery_person_email,
      delivery_date,
      pick_up_address,
      buyer_email: transaction.buyer_email,
      vendor_email: transaction.vendor_email,
    });

    await newShippingDetails.save();

    // Mark transaction as having shipping info submitted
    transaction.shipping_submitted = true;
    await transaction.save();

    await sendShippingDetailsEmailToInitiator(
      transaction.buyer_email,
      shipping_company,
      delivery_person_name,
      delivery_person_number,
      delivery_date,
      pick_up_address
    );

    await sendShippingDetailsEmailToVendor(
      transaction.transaction_id,
      transaction.vendor_name,
      transaction.vendor_email,
      transaction.products.map((p: { name: string }) => p.name).join(", ")
    );

    res.status(200).json({
      status: "success",
      message: "Shipping details submitted successfully",
      newShippingDetails,
    });
  } catch (error) {
    console.error("Error in sellerFillOutShippingDetails:", error);
    return next(errorHandler(500, "Server error"));
  }
};

// export const getAllEscrowProductTransactionByUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     // const user = res?.locals?.user;
//     // const { buyer_email } = req.params;
//     const { user_email } = req.params;

//     // console.log("buyer_email", buyer_email);
//     console.log("user_email", user_email);

//     // if (!buyer_email) {
//     //   return next(errorHandler(400, "Buyer email is required"));
//     // }
//     if (!user_email) {
//       return next(errorHandler(400, "user email is required"));
//     }

//     // const transaction = await Product.find();
//     // const transactions = await Product.$where({ buyer_email: buyer_email });

//     // db.student.find({
//     //   $where: function () {
//     //     return this.name === "Mickel";
//     //   },
//     // });

//     // USE THE USERS EMAIL ATTACHED TO THE PRODUCT INSTEAD OF BUYER OR SELLER

//     const transactions = await productTransaction
//       .find({
//         $or: [
//           { vendor_email: user_email }, // Age greater than 30
//           { buyer_email: user_email }, // OR City is New York
//         ],
//       })
//       .sort({ createdAt: -1 });

//     // Find products where the user (buyer or seller) email matches
//     // const transactions = await Product.find({
//     //   "user.email": user_email, // assuming you have `user` populated in your product schema with `email`
//     // })
//     //   .populate({
//     //     path: "user",
//     //     select: "email", // populating the user field to get email
//     //   })
//     //   .sort({ createdAt: -1 });

//     // const transactions = await Product.find({ buyer_email: buyer_email }).sort({
//     //   createdAt: -1,
//     // });

//     // console.log(transactions);

//     // const { reference } = req.body;

//     // const transaction = await Product.findOne({
//     //   transaction_id: reference,
//     //   verified_payment_status: false,
//     // });

//     if (!transactions || transactions.length === 0) {
//       return next(
//         errorHandler(404, "you don't have any transactions at this time")
//       );
//     } else {
//       res.json({
//         transactions,
//         status: "success",
//         message: "all transactions fetched successfully",
//       });
//     }
//   } catch (error: string | unknown) {
//     console.log(error);
//     // return next(errorHandler(500, "server error"));
//     return next(errorHandler(500, "server error"));
//   }
// };
export const getAllEscrowProductTransactionByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user_email } = req.params;

    if (!user_email) {
      return next(errorHandler(400, "user email is required"));
    }

    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1; // Default to page 1
    const limit = parseInt(req.query.limit as string) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;

    // Fetch total count for pagination metadata
    const total = await ProductTransaction.countDocuments({
      $or: [{ vendor_email: user_email }, { buyer_email: user_email }],
    });

    // Fetch paginated transactions
    const transactions = await ProductTransaction.find({
      $or: [{ vendor_email: user_email }, { buyer_email: user_email }],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!transactions || transactions.length === 0) {
      return next(
        errorHandler(404, "you don't have any transactions at this time")
      );
    }

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    res.json({
      transactions,
      status: "success",
      message: "all transactions fetched successfully",
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return next(errorHandler(500, "server error"));
  }
};

// export const getAllShippingDetails = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     // const user = res?.locals?.user;
//     // const { buyer_email, vendor_email } = req.params;
//     const { user_email } = req.params;

//     console.log("user Email:", user_email);
//     // console.log("Vendor Email:", vendor_email);

//     // console.log("user", user);

//     // if (!buyer_email || !vendor_email) {
//     //   return next(errorHandler(400, "Buyer email or vendor email is required"));
//     // }
//     if (!user_email) {
//       return next(errorHandler(400, "User email is required"));
//     }

//     // Create filter conditions for the query based on provided emails
//     // const matchByMails: noSQLJoinType = {};

//     // if (buyer_email || vendor_email) {
//     //   // matchByMails["product.buyer_email"] = buyer_email as string;
//     //   // matchByMails["product.buyer_email"] = buyer_email;

//     //   // matchByMails["$or"] = [];
//     //   const matchByMails: { $or?: { [key: string]: string }[] } = {};

//     //   matchByMails.$or = matchByMails.$or || [];

//     //   if (buyer_email) {
//     //     matchByMails["$or"].push({ "product.buyer_email": buyer_email });
//     //   }

//     //   if (vendor_email) {
//     //     matchByMails["$or"].push({ "product.vendor_email": vendor_email });
//     //   }
//     // }

//     // if (user_email) {
//     //   // matchByMails["product.buyer_email"] = buyer_email as string;
//     //   // matchByMails["product.buyer_email"] = buyer_email;

//     //   // matchByMails["$or"] = [];
//     //   const matchByMails: { $or?: { [key: string]: string }[] } = {};

//     //   matchByMails.$or = matchByMails.$or || [];

//     //   if (user_email) {
//     //     matchByMails["$or"].push({ "product.buyer_email": user_email });
//     //   }
//     // }

//     // if (vendor_email) {
//     //   // matchByMails["product.vendor_email"] = buyer_email as string;
//     //   matchByMails["product.vendor_email"] = buyer_email;
//     // }

//     // Use aggregate to join ShippingDetails with Product collection
//     // const transactions = await Product.find({
//     //   $or: [
//     //     { vendor_email: user_email }, // Age greater than 30
//     //     { buyer_email: user_email }, // OR City is New York
//     //   ],
//     // }).sort({ createdAt: -1 });

//     const transactions = await ShippingDetails.aggregate([
//       {
//         $match: {
//           $or: [
//             { vendor_email: user_email }, // Age greater than 30
//             { buyer_email: user_email }, // OR City is New York
//           ],
//         },
//       }, // Filter based on buyer or vendor email,
//       {
//         $lookup: {
//           from: "products", // name of the 'Product' collection
//           localField: "product", // field in ShippingDetails that references Product
//           foreignField: "_id", // field in Product collection
//           as: "product",
//         },
//       },
//       { $unwind: "$product" }, // Unwind to access product details directly,
//       { $sort: { createdAt: -1 } }, // Sort by creation date
//     ]);

//     if (!transactions || transactions.length === 0) {
//       res.json({
//         transactions: [],
//         status: "success",
//         message: "you do not have any shipping detail at this time",
//       });
//     } else {
//       res.json({
//         transactions,
//         status: "success",
//         message: "all shipping details fetched successfully",
//       });
//     }
//   } catch (error: string | unknown) {
//     console.log(error);
//     // return next(errorHandler(500, "server error"));
//     return next(errorHandler(500, "server error"));
//   }
// };
export const getAllShippingDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user_email } = req.params;

    if (!user_email) {
      return next(errorHandler(400, "User email is required"));
    }

    // Pagination and search parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || "";

    // Fetch total count for pagination metadata
    const total = await ShippingDetails.countDocuments({
      $or: [{ vendor_email: user_email }, { buyer_email: user_email }],
      ...(search && {
        $or: [
          { shipping_company: { $regex: search, $options: "i" } },
          { delivery_person_name: { $regex: search, $options: "i" } },
          { buyer_email: { $regex: search, $options: "i" } },
        ],
      }),
    });

    // Fetch paginated and filtered transactions
    const transactions = await ShippingDetails.find({
      $or: [{ vendor_email: user_email }, { buyer_email: user_email }],
      ...(search && {
        $or: [
          { shipping_company: { $regex: search, $options: "i" } },
          { delivery_person_name: { $regex: search, $options: "i" } },
          { buyer_email: { $regex: search, $options: "i" } },
        ],
      }),
    })
      .populate({
        path: "product",
        model: "ProductTransaction",
      })
      .populate("user")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!transactions || transactions.length === 0) {
      return res.json({
        transactions: [],
        status: "success",
        message: "You do not have any shipping details at this time",
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    }

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    res.json({
      transactions,
      status: "success",
      message: "All shipping details fetched successfully",
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error in getAllShippingDetails:", error);
    return next(errorHandler(500, "Server error"));
  }
};

// ALTERNATIVE: If you prefer aggregation, use the correct collection name
export const getAllShippingDetailsWithAggregation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user_email } = req.params;

    if (!user_email) {
      return next(errorHandler(400, "User email is required"));
    }

    const transactions = await ShippingDetails.aggregate([
      {
        $match: {
          $or: [{ vendor_email: user_email }, { buyer_email: user_email }],
        },
      },
      {
        $lookup: {
          from: "producttransactions", // Changed from "products" - use the actual collection name
          localField: "product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } }, // Added preserveNullAndEmptyArrays
      { $sort: { createdAt: -1 } },
    ]);

    if (!transactions || transactions.length === 0) {
      return res.json({
        transactions: [],
        status: "success",
        message: "You do not have any shipping details at this time",
      });
    }

    res.json({
      transactions,
      status: "success",
      message: "All shipping details fetched successfully",
    });
  } catch (error) {
    console.error("Error in getAllShippingDetails:", error);
    return next(errorHandler(500, "Server error"));
  }
};

export const buyerConfirmsProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { transaction_id } = req.body;

    if (!transaction_id) {
      return next(errorHandler(400, "Transaction ID is required"));
    }

    console.log(
      `Processing confirmation for transaction_id: ${transaction_id}`
    );

    // Check for existing dispute
    const disputeDetails = await ProductDispute.findOne({ transaction_id });
    console.log(`Dispute details found: ${disputeDetails ? "Yes" : "No"}`);

    // Fetch product transaction details directly
    const fetchProductDetails = await ProductTransaction.findOne({
      transaction_id,
    });

    if (!fetchProductDetails) {
      return next(errorHandler(404, "Transaction not found"));
    }

    console.log(
      "Product transaction found:",
      JSON.stringify(fetchProductDetails, null, 2)
    );

    const {
      transaction_status,
      _id: product_id,
      vendor_name,
      vendor_email,
      buyer_email,
      products,
    } = fetchProductDetails;

    // Get product name from the first product
    const product_name =
      products && products.length > 0 ? products[0].name : "Product";

    // Check if transaction is already completed
    if (transaction_status === "completed") {
      return next(errorHandler(400, "This transaction is already completed"));
    }

    // Check if transaction is in processing status (with or without trailing space)
    const isPending = transaction_status?.trim().toLowerCase() === "processing";

    if (!isPending && transaction_status !== "completed") {
      return next(
        errorHandler(
          400,
          `Transaction status is ${transaction_status}. Only processing transactions can be confirmed.`
        )
      );
    }

    // Update ProductTransaction status to completed and set buyer_confirm_status to true
    const updateProductTransactionStatus =
      await ProductTransaction.findByIdAndUpdate(
        product_id,
        {
          transaction_status: "completed",
          buyer_confirm_status: true,
        },
        { new: true }
      );

    if (!updateProductTransactionStatus) {
      return next(errorHandler(500, "Failed to update product status"));
    }

    console.log(
      `Updated ProductTransaction ${product_id} to completed with buyer confirmation`
    );

    // Resolve dispute if exists and not already resolved
    if (disputeDetails && disputeDetails.dispute_status !== "resolved") {
      await ProductDispute.findByIdAndUpdate(
        disputeDetails._id,
        { dispute_status: "resolved" },
        { new: true }
      );
      console.log(`Resolved dispute for transaction ${transaction_id}`);
    }

    // Send confirmation emails
    await sendSuccessfulEscrowEmailToInitiator(
      transaction_id,
      vendor_name,
      buyer_email,
      product_name
    );
    await sendSuccessfulEscrowEmailToVendor(
      transaction_id,
      vendor_name,
      vendor_email,
      product_name
    );
    console.log(`Emails sent for transaction ${transaction_id}`);

    res.json({
      status: "success",
      message: "Escrow has been completed successfully.",
      data: {
        transaction_id,
        transaction_status: "completed",
        buyer_confirm_status: true,
      },
    });
  } catch (error) {
    console.error("Error in buyerConfirmsProduct:", error);
    return next(errorHandler(500, "Server error"));
  }
};




export const cancelEscrowProductTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { transaction_id } = req.params;

  if (!transaction_id) {
    return next(errorHandler(400, "Transaction ID is required"));
  }

  try {
    const fetchProductDetails = await ProductTransaction.findOne({
      transaction_id,
    });

    if (!fetchProductDetails) {
      return next(errorHandler(404, "Transaction not found"));
    }

    const productTransactionStatus =
      fetchProductDetails.transaction_status?.trim();

    const fetchDisputeDetails = await ProductDispute.findOne({
      transaction_id,
    });
    const productDisputeStatus = fetchDisputeDetails?.dispute_status;

    if (productTransactionStatus === "cancelled") {
      return next(
        errorHandler(400, "This transaction has already been cancelled")
      );
    }
    if (productTransactionStatus === "completed") {
      return next(
        errorHandler(400, "This transaction has already been completed")
      );
    }
    if (productDisputeStatus === "resolved") {
      return next(
        errorHandler(400, "This transaction has already been resolved")
      );
    }

    const updateProductTransactionStatus =
      await ProductTransaction.findByIdAndUpdate(
        fetchProductDetails._id,
        { transaction_status: "cancelled" },
        { new: true }
      );

    if (!updateProductTransactionStatus) {
      return next(errorHandler(500, "Failed to update transaction status"));
    }

    if (fetchDisputeDetails) {
      await ProductDispute.findByIdAndUpdate(
        fetchDisputeDetails._id,
        { dispute_status: "cancelled" },
        { new: true }
      );
    }

    res.json({
      status: "success",
      message: "Transaction has been cancelled successfully",
    });
  } catch (error) {
    return next(errorHandler(500, "Internal server error"));
  }
};
