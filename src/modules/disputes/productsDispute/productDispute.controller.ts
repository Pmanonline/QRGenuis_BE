// import { Request, Response, NextFunction } from "express";
// import { validateFormFields } from "../../../utilities/validation.utilities";
// import IndividualUser from "../../authentication/individualUserAuth/individualUserAuth.model1";
// import ProductTransaction from "../../transactions/productsTransaction/productsTransaction.model";
// import ProductDispute from "./productDispute.model";
// import { errorHandler } from "../../../middlewares/errorHandling.middleware";
// import {
//   BuyerResolveDisputeParams,
//   BuyerResolveDisputeBody,
//   BuyerResolveDisputeResponse,
//   SellerResolveDisputeParams,
//   SellerResolveDisputeResponse,
//   SellerResolveDisputeBody,
// } from "./productDispute.interface";
// import { log } from "console";
// import {
//   sendBuyerResolutionMailToBuyer,
//   sendBuyerResolutionMailToSeller,
//   sendDisputeMailToBuyer,
//   sendDisputeMailToSeller,
//   sendSellerResolutionMailToBuyer,
//   sendSellerResolutionMailToSeller,
// } from "./productDispute.mail";
// // import productTransaction from "../../transactions/productsTransaction/productsTransaction.model";
// // seller rejects escrow initiated
// /*
//     1. accepts:- buyer are given their "create transaction" form to edit
//     2. rejects:-
//         a. cancels the escrow initiated
//         b. involves a mediator
//             - mediator receives mail

//  */

// // seller fills the "raise dispute form"
// // - buyer gets an email
// // - goes to the platform "dispute interface" and "view details"
// // - the popup with 3 buttons to "cancel transaction" "resolve" or "involve a mediator"
// // - onclick of cancel transaction, the buyer is alerted and the transaction_status on transaction table is set to "cancelled" and dispute status is set to "resolved"
// // - onclick of resolve, the transaction form that the buyer filled is shown to the buyer to edit and resubmit, then seller is alerted via email.
// /////// - if the seller still refuses, the only option left is to involve a mediator
// /////// - if the seller agrees, the normal transaction process continues
// // - onclick of "involve a meditator", a form is filled and mediator gets a mail

// export const raiseDispute = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   // dispute form
//   const {
//     transaction_id, // prefill this
//     user_email,
//     buyer_email, // prefill this
//     vendor_name, // prefill this
//     vendor_email, // prefill this
//     vendor_phone_number, // prefill this
//     // dispute_raised_by, // prefill this with the email of the authenticated user
//     product_name,
//     product_image,
//     reason_for_dispute,
//     dispute_description,
//   } = req.body;

//   let dispute_raised_by = req?.body?.dispute_raised_by; // allow reassignment

//   validateFormFields(
//     {
//       product_name,
//       product_image,
//       transaction_id, // prefill this
//       reason_for_dispute,
//       dispute_description,
//     },
//     next
//   );

//   try {
//     // find the user who initiated the transaction
//     const user = await IndividualUser.findOne({ email: user_email });
//     console.log("user_email", user_email);

//     //   find the transaction by id
//     const transaction = await ProductTransaction.findOne({
//       transaction_id: transaction_id,
//     });

//     const transactionStatus: string | undefined =
//       transaction?.transaction_status as string | undefined;

//     // const didBuyerRaiseDispute =
//     // if()

//     // log("transaction", transaction);
//     // log("user", user);

//     if (!user) {
//       return next(errorHandler(404, "User not found"));
//     } else if (!transaction) {
//       return next(errorHandler(404, "Transaction not found"));
//     } else if (buyer_email === vendor_email) {
//       return next(
//         errorHandler(400, "You cannot raise a dispute against yourself")
//       );
//     } else if (transactionStatus === "completed") {
//       return next(
//         errorHandler(
//           400,
//           "You cannot raise a dispute for this transaction because it has already been completed"
//         )
//       );
//     } else if (transactionStatus === "cancelled") {
//       return next(
//         errorHandler(
//           400,
//           "You cannot raise a dispute for this transaction because it has already been cancelled"
//         )
//       );
//     } else if (transactionStatus === "inDispute") {
//       return next(
//         errorHandler(
//           400,
//           "You cannot raise a dispute for this transaction because it is already in dispute"
//         )
//       );
//     }

//     if (user_email === vendor_email) {
//       dispute_raised_by = "seller";
//     } else if (user_email === buyer_email) {
//       dispute_raised_by = "buyer";
//     }

//     // else {
//     // we want to update the transaction status to "inDispute" when a dispute is raised
//     const updateProductTransactionStatus =
//       await ProductTransaction.findByIdAndUpdate(
//         transaction._id,
//         { $set: { transaction_status: "inDispute" } },
//         { new: true, useFindAndModify: true } // to return the updated document
//       );

//     if (!updateProductTransactionStatus) {
//       return next(errorHandler(500, "Failed to update transaction status"));
//     }

//     // detaiils of the dispute saved to DB
//     const newProductDispute = new ProductDispute({
//       user: user,
//       transaction: transaction,
//       transaction_id,
//       product_name,
//       product_image,
//       buyer_email,
//       vendor_name,
//       vendor_email,
//       vendor_phone_number,
//       dispute_raised_by,
//       dispute_raised_by_email: user_email,
//       reason_for_dispute,
//       dispute_description,
//     });

//     await newProductDispute.save();

//     // send mail to the buyer that the seller has raised a dispute
//     // await sendDisputeMailToBuyer(
//     //   buyer_email,
//     //   product_name,
//     //   dispute_description
//     // );
//     // await sendDisputeMailToSeller(
//     //   vendor_email,
//     //   product_name,
//     //   dispute_description
//     // );

//     await Promise.all([
//       sendDisputeMailToBuyer(buyer_email, product_name, dispute_description),

//       await sendDisputeMailToSeller(
//         vendor_email,
//         product_name,
//         dispute_description
//       ),
//     ]);

//     res.json({
//       status: "success",
//       message: "Dispute has been raised successfully",
//     });
//     // }
//   } catch (error: string | unknown) {
//     console.log("error", error);
//     return next(errorHandler(500, "Internal server error"));
//   }
// };

// // FLIP SIDE OF THE LOGIC
// // buyer rejects the goods, then fills the dispute form and send to the seller
// /*
//     1. accepts:- fills the dispute resolution form
//     2. rejects:-
//         a. cancels the escrow initiated - who bears the consequence
//         b. involves a mediator
//             - mediator receives mail

//  */

// export const getAllDisputesByUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { user_email } = req.params;

//     if (!user_email) {
//       return next(errorHandler(400, "User email is required"));
//     }

//     const fetchDisputeDetails = await ProductDispute.find({
//       $or: [{ vendor_email: user_email }, { buyer_email: user_email }],
//     }).sort({ createdAt: -1 });

//     if (!fetchDisputeDetails || fetchDisputeDetails?.length === 0) {
//       return next(errorHandler(404, "No disputes found for this user"));
//     } else {
//       res.json({
//         fetchDisputeDetails,
//         status: "success",
//         message: "all disputes have been fetched successfully",
//       });
//     }
//   } catch (error: string | unknown) {
//     console.log("error", error);
//     return next(errorHandler(500, "Internal server error"));
//   }
// };

// // change to cancel dispute function
// // export const cancelEscrow = async (
// //   req: Request,
// //   res: Response,
// //   next: NextFunction
// // ) => {
// //   const { transaction_id } = req.body;

// //   if (!transaction_id)
// //     return next(errorHandler(400, "Transaction ID is required"));

// //   try {
// //     const fetchProductDetails = await ProductTransaction.findOne({
// //       transaction_id: transaction_id,
// //     });

// //     const productTransactionStatus: string | undefined =
// //       fetchProductDetails?.transaction_status as string | undefined;

// //     const fetchDisputeDetails = await ProductDispute.findOne({
// //       transaction_id: transaction_id,
// //     });

// //     const productDisputeStatus: string | undefined =
// //       fetchDisputeDetails?.dispute_status as string | undefined;

// //     if (productTransactionStatus === "cancelled") {
// //       return next(
// //         errorHandler(
// //           400,
// //           "This transaction cannot be cancelled because it has already been cancelled"
// //         )
// //       );
// //     } else if (productTransactionStatus === "completed") {
// //       return next(
// //         errorHandler(
// //           400,
// //           "This transaction cannot be cancelled because it has already been completed"
// //         )
// //       );
// //     } else if (productDisputeStatus === "resolved") {
// //       return next(
// //         errorHandler(
// //           400,
// //           "This transaction cannot be cancelled because it has already been resolved"
// //         )
// //       );
// //     }
// //     // else if (productTransactionStatus === "processing" || productTransactionStatus === "inDispute" || productDisputeStatus === "processing") {
// //     //   const updateProductTransactionStatus =
// //     // }

// //     // update the product transaction status to "cancelled"
// //     const updateProductTransactionStatus =
// //       await ProductTransaction.findByIdAndUpdate(
// //         fetchProductDetails?._id,
// //         { transaction_status: "cancelled" },
// //         { new: true } // to return the updated document
// //       );

// //     if (!updateProductTransactionStatus) {
// //       return next(errorHandler(500, "Failed to update transaction status"));
// //     }

// //     // update the dispute status to "cancelled"
// //     const updateProductDisputeStatus = await ProductDispute.findByIdAndUpdate(
// //       fetchDisputeDetails?._id,
// //       { dispute_status: "cancelled" },
// //       { new: true } // to return the updated document
// //     );
// //     if (!updateProductDisputeStatus) {
// //       return next(errorHandler(500, "Failed to update dispute status"));
// //     }
// //     // send mail to the buyer and seller that the dispute has been cancelled

// //     // send mail to the buyer that the seller has raised a dispute
// //     // await sendTransactionCancellationMailToBuyer(
// //     //   buyer_email,
// //     //   product_name,
// //     //   dispute_description
// //     // );
// //     // await sendTransactionCancellationMailToSeller(
// //     //   vendor_email,
// //     //   product_name,
// //     //   dispute_description
// //     // );

// //     res.json({
// //       status: "success",
// //       message: "Dispute has been cancelled successfully",
// //     });
// //   } catch (error: string | unknown) {
// //     console.log("error", error);
// //     return next(errorHandler(500, "Internal server error"));
// //   }

// //   // try {
// //   //   const fetchProductDetails = await ProductDispute.aggregate([
// //   //     {
// //   //       $lookup: {
// //   //         from: "products",
// //   //         localField: "product",
// //   //         foreignField: "_id",
// //   //         as: "productDetails",
// //   //       },
// //   //     },
// //   //     { $unwind: "$productDetails" },
// //   //     {
// //   //       $match: {
// //   //         "productDetails.transaction_id": transaction_id,
// //   //       },
// //   //     },
// //   //     {
// //   //       $project: {
// //   //         transaction_status: "$productDetails.transaction_status",
// //   //         product_id: "$productDetails._id",
// //   //         vendor_email: "$vendor_email",
// //   //         buyer_email: "$buyer_email",
// //   //         product_name: "$productDetails.product_name",
// //   //       },
// //   //     },
// //   //   ]);

// //   //   if (!fetchProductDetails || fetchProductDetails.length === 0) {
// //   //     return next(errorHandler(404, "Dispute details not found"));
// //   //   }

// //   //   const {
// //   //     transaction_status,
// //   //     product_id,
// //   //     vendor_email,
// //   //     buyer_email,
// //   //     product_name,
// //   //   } = fetchProductDetails[0];

// //   //   const fetchDisputeDetails = ProductDispute.findOne({
// //   //     transaction_id: transaction_id,
// //   //   });

// //   //   console.log(fetchDisputeDetails);

// //   //   if (transaction_status === "cancelled") {
// //   //     return next(
// //   //       errorHandler(
// //   //         400,
// //   //         "This transaction cannot be cancelled because it has already been cancelled"
// //   //       )
// //   //     );
// //   //   } else if (transaction_status === "completed") {
// //   //     return next(
// //   //       errorHandler(
// //   //         400,
// //   //         "This transaction cannot be cancelled because it has already been completed"
// //   //       )
// //   //     );
// //   //   }
// //   //   // else if (fetchDisputeDetails === "") {
// //   //   // }
// //   // } catch (error: string | unknown) {
// //   //   console.log("error", error);
// //   //   return next(errorHandler(500, "Internal server error"));
// //   // }
// // };

// // byuer resolve dispute
// export const buyerResolveDispute = async (
//   req: Request<BuyerResolveDisputeParams, {}, BuyerResolveDisputeBody>,
//   res: Response<BuyerResolveDisputeResponse>,
//   next: NextFunction
// ): Promise<void> => {
//   // when buyer clicks on the resolution button, they get the form that they used in initializing transaction for an update requested in the dispute

//   // every field in the form should be prefilled
//   const {
//     vendor_name,
//     vendor_phone_number,
//     vendor_email,
//     transaction_type,
//     product_name,
//     product_quantity,
//     product_price,
//     transaction_total,
//     product_image,
//     product_description,
//     signed_escrow_doc,
//     delivery_address,
//   } = req.body;

//   const { transaction_id } = req.params;

//   try {
//     const productDetails = await ProductTransaction.findOne({
//       transaction_id: transaction_id,
//       transaction_status: "inDispute",
//     });

//     const disputeDetails = await ProductDispute.findOne({
//       transaction_id: transaction_id,
//     });

//     if (!productDetails) {
//       return next(errorHandler(404, "No dispute found for this transaction"));
//     } else if (!disputeDetails) {
//       return next(errorHandler(404, "Dispute does not exist"));
//     }

//     // Check dispute status
//     if (
//       !["Not in Dispute", "processing"].includes(disputeDetails.dispute_status)
//     ) {
//       return next(
//         errorHandler(
//           400,
//           `Cannot update dispute: Current status is ${disputeDetails.dispute_status}`
//         )
//       );
//     }

//     if (
//       disputeDetails.dispute_resolution_method === "mediator" &&
//       disputeDetails.mediator
//     ) {
//       return next(
//         errorHandler(
//           400,
//           "Cannot resolve dispute: A mediator is assigned to this dispute"
//         )
//       );
//     }

//     const updateTransaction = await ProductTransaction.findByIdAndUpdate(
//       productDetails?._id,
//       {
//         $set: {
//           vendor_name: vendor_name || productDetails.vendor_name,
//           vendor_phone_number:
//             vendor_phone_number || productDetails.vendor_phone_number,
//           vendor_email: vendor_email || productDetails.vendor_email,
//           transaction_type: transaction_type || productDetails.transaction_type,
//           product_name: product_name || productDetails.product_name,
//           product_quantity: product_quantity || productDetails.product_quantity,
//           product_price: product_price || productDetails.product_price,
//           transaction_total:
//             transaction_total || productDetails.transaction_total,
//           product_image: product_image || productDetails.product_image,
//           product_description:
//             product_description || productDetails.product_description,
//           signed_escrow_doc:
//             signed_escrow_doc || productDetails.signed_escrow_doc,
//           delivery_address: delivery_address || productDetails.delivery_address,
//         },
//       },
//       { new: true, runValidators: true } // to return the updated document
//     );

//     if (!updateTransaction) {
//       return next(errorHandler(500, "Failed to update transaction"));
//     }

//     // const updateDispute = await ProductDispute.findByIdAndUpdate(
//     //   disputeDetails?._id,
//     //   {
//     //     $set: {
//     //       dispute_status: "resolving",
//     //     },
//     //   },
//     //   { new: true, runValidators: true, useFindAndModify: false } // to return the updated document
//     // );

//     // Update ProductDispute status
//     const updateDispute = await ProductDispute.findByIdAndUpdate(
//       disputeDetails._id,
//       {
//         $set: {
//           dispute_status: "resolving",
//           dispute_resolution_method:
//             disputeDetails.dispute_resolution_method || "dispute_parties",
//         },
//       },
//       { new: true, runValidators: true }
//     ).populate("transaction user mediator");

//     if (!updateDispute) {
//       return next(errorHandler(500, "Failed to update transaction"));
//     }
//     // const updateDispute = await ProductDispute.findByIdAndUpdate(
//     //   productDetails?._id,
//     //   {
//     //     $set: {
//     //       vendor_name: vendor_name || disputeDetails?.vendor_name,
//     //       vendor_phone_number:
//     //         vendor_phone_number || disputeDetails?.vendor_phone_number,
//     //       vendor_email: vendor_email || disputeDetails?.vendor_email,

//     //       product_name: product_name || disputeDetails?.product_name,
//     //       product_image: product_image || disputeDetails?.product_image,
//     //       reason_for_dispute: disputeDetails?.reason_for_dispute,
//     //       dispute_description: disputeDetails?.dispute_description,
//     //     },
//     //   },
//     //   { new: true, runValidators: true, useFindAndModify: false } // to return the updated document
//     // );

//     log("updatedTransaction", updateTransaction);
//     log("updateDispute", updateDispute);

//     await Promise.all([
//       sendBuyerResolutionMailToBuyer(
//         updateDispute.buyer_email,
//         updateDispute.product_name
//       ),
//       sendBuyerResolutionMailToSeller(
//         updateDispute.vendor_email,
//         updateDispute.product_name
//       ),
//     ]);

//     // if (!updateDispute) {
//     //   return next(errorHandler(500, "Failed to update transaction"));
//     // }

//     res.json({
//       status: "success",
//       message:
//         "Transaction form updated successfully and dispute is being resolved",
//       data: {
//         dispute: updateDispute,
//       },
//       // userResolvingDispute,
//     });
//   } catch (error) {
//     console.log("error", error);
//     return next(errorHandler(500, "Internal server error"));
//   }
// };

// // export const buyerResolveDispute = async (
// //   req: Request,
// //   res: Response,
// //   next: NextFunction
// // ) => {
// //   const {
// //     transaction_id,
// //     vendor_name,
// //     vendor_phone_number,
// //     vendor_email,
// //     transaction_type,
// //     product_name,
// //     product_quantity,
// //     product_price,
// //     transaction_total,
// //     product_image,
// //     product_description,
// //     signed_escrow_doc,
// //     delivery_address,
// //   } = req.body;

// //   // Validate required fields
// //   if (!transaction_id) {
// //     return next(errorHandler(400, "Transaction ID is required"));
// //   }

// //   validateProductFields(
// //     {
// //       vendor_name,
// //       vendor_phone_number,
// //       vendor_email,
// //       transaction_type,
// //       product_name,
// //       product_quantity,
// //       product_price,
// //       transaction_total,
// //       product_image,
// //       product_description,
// //       delivery_address,
// //     },
// //     next
// //   );

// //   try {
// //     // Find the user (buyer) who is resolving the dispute
// //     const user = await IndividualUser.findOne({
// //       email: req.user?.email || req.body.buyer_email,
// //     });
// //     if (!user) {
// //       return next(errorHandler(404, "User not found"));
// //     }

// //     // Find the transaction by transaction_id and verify it belongs to the buyer
// //     const transaction = await ProductTransaction.findOne({
// //       transaction_id,
// //       buyer_email: user.email,
// //     });

// //     if (!transaction) {
// //       return next(
// //         errorHandler(
// //           404,
// //           "Transaction not found or you are not authorized to update it"
// //         )
// //       );
// //     }

// //     // Check if transaction_status is 'inDispute'
// //     if (transaction.transaction_status !== "inDispute") {
// //       return next(
// //         errorHandler(
// //           400,
// //           `Cannot resolve dispute: Transaction is in '${transaction.transaction_status}' status. Only transactions in 'inDispute' status can be updated.`
// //         )
// //       );
// //     }

// //     // Prevent buyer from updating their own email or vendor's email to match
// //     if (vendor_email === user.email) {
// //       return next(
// //         errorHandler(400, "Vendor email cannot be the same as buyer email")
// //       );
// //     }

// //     // Update transaction fields (only those provided in the request)
// //     transaction.vendor_name = vendor_name || transaction.vendor_name;
// //     transaction.vendor_phone_number =
// //       vendor_phone_number || transaction.vendor_phone_number;
// //     transaction.vendor_email = vendor_email || transaction.vendor_email;
// //     transaction.transaction_type =
// //       transaction_type || transaction.transaction_type;
// //     transaction.product_name = product_name || transaction.product_name;
// //     transaction.product_quantity =
// //       product_quantity || transaction.product_quantity;
// //     transaction.product_price = product_price || transaction.product_price;
// //     transaction.transaction_total =
// //       transaction_total || transaction.transaction_total;
// //     transaction.product_image = product_image || transaction.product_image;
// //     transaction.product_description =
// //       product_description || transaction.product_description;
// //     transaction.signed_escrow_doc =
// //       signed_escrow_doc || transaction.signed_escrow_doc;
// //     transaction.delivery_address =
// //       delivery_address || transaction.delivery_address;

// //     // Optionally update dispute-related status (e.g., mark as resolved)
// //     transaction.transaction_status = "dispute_resolved"; // Adjust status as per your schema

// //     // Save the updated transaction
// //     await transaction.save();

// //     // Send response
// //     res.json({
// //       status: "success",
// //       message: "Transaction updated successfully to resolve dispute",
// //       transaction,
// //     });
// //   } catch (error: string | unknown) {
// //     console.error(error);
// //     return next(errorHandler(500, "Server error"));
// //   }
// // };

// // seller resolve dispute
// export const sellerResolveDispute = async (
//   req: Request<
//     SellerResolveDisputeParams,
//     SellerResolveDisputeResponse,
//     SellerResolveDisputeBody
//   >,
//   res: Response<SellerResolveDisputeResponse>,
//   next: NextFunction
// ) => {
//   // dispute resolution form
//   const { resolution_description } = req.body;
//   const { transaction_id } = req.params;

//   validateFormFields(
//     {
//       resolution_description,
//     },
//     next
//   );
//   try {
//     // find the dispute by id
//     // const disputeDetails = await ProductDispute.findOne({
//     //   dispute_id: dispute_id,
//     // });

//     // const disputeStatus: string | undefined = disputeDetails?.dispute_status as
//     //   | string
//     //   | undefined;

//     // if (!disputeDetails) {
//     //   return next(errorHandler(404, "This dispute does not exist"));
//     // } else if (disputeStatus === "resolved") {
//     //   return next(errorHandler(400, "This dispute has been resolved"));
//     // } else if (disputeStatus === "cancelled") {
//     //   return next(errorHandler(400, "This dispute has been cancelled"));
//     // }

//     // if (
//     //   disputeDetails.dispute_resolution_method === "mediator" &&
//     //   disputeDetails.mediator
//     // ) {
//     //   return next(
//     //     errorHandler(
//     //       400,
//     //       "Cannot resolve dispute: A mediator is assigned to this dispute"
//     //     )
//     //   );
//     // }

//     // Find the dispute and transaction
//     const disputeDetails = await ProductDispute.findOne({
//       transaction_id,
//     }).populate("transaction user");

//     const productDetails = await ProductTransaction.findOne({
//       transaction_id,
//       transaction_status: "inDispute",
//     });

//     if (!disputeDetails) {
//       return next(errorHandler(404, "Dispute does not exist"));
//     }

//     if (!productDetails) {
//       return next(errorHandler(404, "No dispute found for this transaction"));
//     }

//     // Check dispute status
//     if (disputeDetails.dispute_status === "resolved") {
//       return next(errorHandler(400, "This dispute has been resolved"));
//     }

//     if (disputeDetails.dispute_status === "cancelled") {
//       return next(errorHandler(400, "This dispute has been cancelled"));
//     }

//     // update the transaction status to "resolved"
//     // const updatedTransaction = await ProductTransaction.findByIdAndUpdate(
//     //   disputeDetails?._id,
//     //   { transaction_status: "resolved" },
//     //   { new: true }
//     // );
//     // if (!updatedTransaction) {
//     //   return next(errorHandler(500, "Failed to update transaction status"));
//     // }

//     // Update ProductTransaction status
//     const updatedTransaction = await ProductTransaction.findByIdAndUpdate(
//       productDetails._id,
//       { $set: { transaction_status: "completed" } },
//       { new: true, runValidators: true }
//     );

//     if (!updatedTransaction) {
//       return next(errorHandler(500, "Failed to update transaction status"));
//     }

//     // Update ProductDispute with resolution details
//     const updateDispute = await ProductDispute.findByIdAndUpdate(
//       disputeDetails._id,
//       {
//         $set: {
//           dispute_status: "resolving",
//           dispute_resolution_method:
//             disputeDetails.dispute_resolution_method || "dispute_parties",
//         },
//       },
//       { new: true, runValidators: true }
//     ).populate("transaction user mediator");

//     if (!updateDispute) {
//       return next(errorHandler(500, "Failed to update transaction"));
//     }
//     // send mail to the buyer and seller that the dispute has been resolved
//     await Promise.all([
//       sendSellerResolutionMailToBuyer(
//         updateDispute.buyer_email,
//         updateDispute.product_name
//       ),
//       sendSellerResolutionMailToSeller(
//         updateDispute.vendor_email,
//         updateDispute.product_name
//       ),
//     ]);

//     // if (!updateDispute) {
//     //   return next(errorHandler(500, "Failed to update transaction"));
//     // }

//     res.json({
//       status: "success",
//       message:
//         "Transaction form updated successfully and dispute is being resolved",
//       data: {
//         dispute: updateDispute,
//       },
//       // userResolvingDispute,
//     });
//   } catch (error: string | unknown) {
//     console.log("error", error);
//     return next(errorHandler(500, "Internal server error"));
//   }
// };

// // export const resolveDispute = async (
// //   req: Request,
// //   res: Response,
// //   next: NextFunction
// // ) => {
// //   // dispute resolution form
// //   const { transaction_id, resolution_description } = req.body;

// //   validateFormFields(
// //     {
// //       transaction_id,
// //       resolution_description,
// //     },
// //     next
// //   );

// //   try {
// //     // find the transaction by id
// //     const transaction = await ProductTransaction.findOne({
// //       transaction_id: transaction_id,
// //     });

// //     if (!transaction) {
// //       return next(errorHandler(404, "Transaction not found"));
// //     }

// //     // update the transaction status to "resolved"
// //     const updatedTransaction = await ProductTransaction.findByIdAndUpdate(
// //       transaction._id,
// //       { transaction_status: "resolved" },
// //       { new: true }
// //     );

// //     if (!updatedTransaction) {
// //       return next(errorHandler(500, "Failed to update transaction status"));
// //     }

// //     // send mail to the buyer and seller that the dispute has been resolved

// //     res.json({
// //       status: "success",
// //       message: "Dispute has been resolved successfully",
// //     });
// //   } catch (error: string | unknown) {
// //     console.log("error", error);
// //     return next(errorHandler(500, "Internal server error"));
// //   }
// // };

import { Request, Response, NextFunction } from "express";
import { validateFormFields } from "../../../utilities/validation.utilities";
import IndividualUser from "../../authentication/individualUserAuth/individualUserAuth.model";
import ProductTransaction from "../../transactions/productsTransaction/productsTransaction.model";
import ProductDispute from "./productDispute.model";
import { errorHandler } from "../../../middlewares/errorHandling.middleware";
import {
  BuyerResolveDisputeParams,
  BuyerResolveDisputeBody,
  BuyerResolveDisputeResponse,
  SellerResolveDisputeParams,
  SellerResolveDisputeResponse,
  SellerResolveDisputeBody,
} from "./productDispute.interface";
import { log } from "console";
import {
  sendBuyerResolutionMailToBuyer,
  sendBuyerResolutionMailToSeller,
  sendDisputeMailToBuyer,
  sendDisputeMailToSeller,
  sendSellerResolutionMailToBuyer,
  sendSellerResolutionMailToSeller,
} from "./productDispute.mail";

export const raiseDispute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    transaction_id,
    user_email,
    buyer_email,
    vendor_name,
    vendor_email,
    vendor_phone_number,
    product_name,
    product_image,
    reason_for_dispute,
    dispute_description,
  } = req.body;

  let dispute_raised_by = req?.body?.dispute_raised_by;

  validateFormFields(
    {
      product_name,
      product_image,
      transaction_id,
      reason_for_dispute,
      dispute_description,
    },
    next
  );

  try {
    const user = await IndividualUser.findOne({ email: user_email });
    console.log("user_email", user_email);

    const transaction = await ProductTransaction.findOne({
      transaction_id: transaction_id,
    });

    const transactionStatus: string | undefined =
      transaction?.transaction_status as string | undefined;

    if (!user) {
      return next(errorHandler(404, "User not found"));
    } else if (!transaction) {
      return next(errorHandler(404, "Transaction not found"));
    } else if (buyer_email === vendor_email) {
      return next(
        errorHandler(400, "You cannot raise a dispute against yourself")
      );
    } else if (transactionStatus === "completed") {
      return next(
        errorHandler(
          400,
          "You cannot raise a dispute for this transaction because it has already been completed"
        )
      );
    } else if (transactionStatus === "cancelled") {
      return next(
        errorHandler(
          400,
          "You cannot raise a dispute for this transaction because it has already been cancelled"
        )
      );
    } else if (transactionStatus === "inDispute") {
      return next(
        errorHandler(
          400,
          "You cannot raise a dispute for this transaction because it is already in dispute"
        )
      );
    }

    if (user_email === vendor_email) {
      dispute_raised_by = "seller";
    } else if (user_email === buyer_email) {
      dispute_raised_by = "buyer";
    }

    const updateProductTransactionStatus =
      await ProductTransaction.findByIdAndUpdate(
        transaction._id,
        { $set: { transaction_status: "inDispute" } },
        { new: true }
      );

    if (!updateProductTransactionStatus) {
      return next(errorHandler(500, "Failed to update transaction status"));
    }

    // Populate products array from transaction, filtered by product_name and product_image
    const matchingProducts = transaction.products.filter(
      (p) => p.name === product_name && p.image === product_image
    );
    if (matchingProducts.length === 0) {
      return next(
        errorHandler(400, "Provided product details do not match transaction")
      );
    }

    const newProductDispute = new ProductDispute({
      user,
      transaction: transaction._id,
      mediator: null,
      transaction_id,
      buyer_email,
      vendor_name,
      vendor_email,
      vendor_phone_number,
      product_name,
      product_image,
      products: matchingProducts.map((p) => ({
        name: p.name,
        quantity: p.quantity,
        price: p.price,
        image: p.image,
        description: p.description,
      })),
      reason_for_dispute,
      dispute_description,
      dispute_raised_by,
      dispute_raised_by_email: user_email,
    });

    await newProductDispute.save();

    await Promise.all([
      sendDisputeMailToBuyer(buyer_email, product_name, dispute_description),
      sendDisputeMailToSeller(vendor_email, product_name, dispute_description),
    ]);

    res.json({
      status: "success",
      message: "Dispute has been raised successfully",
    });
  } catch (error: string | unknown) {
    console.log("error", error);
    return next(errorHandler(500, "Internal server error"));
  }
};

export const getAllDisputesByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user_email } = req.params;

    if (!user_email) {
      return next(errorHandler(400, "User email is required"));
    }

    const fetchDisputeDetails = await ProductDispute.find({
      $or: [{ vendor_email: user_email }, { buyer_email: user_email }],
    }).sort({ createdAt: -1 });

    if (!fetchDisputeDetails || fetchDisputeDetails?.length === 0) {
      return next(errorHandler(404, "No disputes found for this user"));
    } else {
      res.json({
        fetchDisputeDetails,
        status: "success",
        message: "all disputes have been fetched successfully",
      });
    }
  } catch (error: string | unknown) {
    console.log("error", error);
    return next(errorHandler(500, "Internal server error"));
  }
};

export const buyerResolveDispute = async (
  req: Request<BuyerResolveDisputeParams, {}, BuyerResolveDisputeBody>,
  res: Response<BuyerResolveDisputeResponse>,
  next: NextFunction
): Promise<void> => {
  const {
    vendor_name,
    vendor_phone_number,
    vendor_email,
    transaction_type,
    product_name,
    product_quantity,
    product_price,
    transaction_total,
    product_image,
    product_description,
    signed_escrow_doc,
    delivery_address,
  } = req.body;

  const { transaction_id } = req.params;

  try {
    const productDetails = await ProductTransaction.findOne({
      transaction_id: transaction_id,
      transaction_status: "inDispute",
    });

    const disputeDetails = await ProductDispute.findOne({
      transaction_id: transaction_id,
    });

    if (!productDetails) {
      return next(errorHandler(404, "No dispute found for this transaction"));
    } else if (!disputeDetails) {
      return next(errorHandler(404, "Dispute does not exist"));
    }

    if (
      !["Not in Dispute", "processing"].includes(disputeDetails.dispute_status)
    ) {
      return next(
        errorHandler(
          400,
          `Cannot update dispute: Current status is ${disputeDetails.dispute_status}`
        )
      );
    }

    if (
      disputeDetails.dispute_resolution_method === "mediator" &&
      disputeDetails.mediator
    ) {
      return next(
        errorHandler(
          400,
          "Cannot resolve dispute: A mediator is assigned to this dispute"
        )
      );
    }

    const updatedProducts = productDetails.products.map((p) => {
      if (p.name === product_name) {
        return {
          ...p,
          quantity: product_quantity || p.quantity,
          price: product_price || p.price,
          image: product_image || p.image,
          description: product_description || p.description,
        };
      }
      return p;
    });

    const updateTransaction = await ProductTransaction.findByIdAndUpdate(
      productDetails._id,
      {
        $set: {
          vendor_name: vendor_name || productDetails.vendor_name,
          vendor_phone_number:
            vendor_phone_number || productDetails.vendor_phone_number,
          vendor_email: vendor_email || productDetails.vendor_email,
          transaction_type: transaction_type || productDetails.transaction_type,
          products: updatedProducts,
          transaction_total:
            transaction_total || productDetails.transaction_total,
          signed_escrow_doc:
            signed_escrow_doc || productDetails.signed_escrow_doc,
          delivery_address: delivery_address || productDetails.delivery_address,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updateTransaction) {
      return next(errorHandler(500, "Failed to update transaction"));
    }

    const updateDispute = await ProductDispute.findByIdAndUpdate(
      disputeDetails._id,
      {
        $set: {
          dispute_status: "resolving",
          dispute_resolution_method:
            disputeDetails.dispute_resolution_method || "dispute_parties",
        },
      },
      { new: true, runValidators: true }
    ).populate("transaction user mediator");

    if (!updateDispute) {
      return next(errorHandler(500, "Failed to update transaction"));
    }

    log("updatedTransaction", updateTransaction);
    log("updateDispute", updateDispute);

    await Promise.all([
      sendBuyerResolutionMailToBuyer(updateDispute.buyer_email, product_name),
      sendBuyerResolutionMailToSeller(updateDispute.vendor_email, product_name),
    ]);

    res.json({
      status: "success",
      message:
        "Transaction form updated successfully and dispute is being resolved",
      data: {
        dispute: updateDispute,
      },
    });
  } catch (error) {
    console.log("error", error);
    return next(errorHandler(500, "Internal server error"));
  }
};

export const sellerResolveDispute = async (
  req: Request<
    SellerResolveDisputeParams,
    SellerResolveDisputeResponse,
    SellerResolveDisputeBody
  >,
  res: Response<SellerResolveDisputeResponse>,
  next: NextFunction
) => {
  const { resolution_description } = req.body;
  const { transaction_id } = req.params;

  validateFormFields(
    {
      resolution_description,
    },
    next
  );

  try {
    const disputeDetails = await ProductDispute.findOne({
      transaction_id,
    }).populate("transaction user");

    const productDetails = await ProductTransaction.findOne({
      transaction_id,
      transaction_status: "inDispute",
    });

    if (!disputeDetails) {
      return next(errorHandler(404, "Dispute does not exist"));
    }

    if (!productDetails) {
      return next(errorHandler(404, "No dispute found for this transaction"));
    }

    if (disputeDetails.dispute_status === "resolved") {
      return next(errorHandler(400, "This dispute has been resolved"));
    }

    if (disputeDetails.dispute_status === "cancelled") {
      return next(errorHandler(400, "This dispute has been cancelled"));
    }

    const updatedTransaction = await ProductTransaction.findByIdAndUpdate(
      productDetails._id,
      { $set: { transaction_status: "completed" } },
      { new: true, runValidators: true }
    );

    if (!updatedTransaction) {
      return next(errorHandler(500, "Failed to update transaction status"));
    }

    const updateDispute = await ProductDispute.findByIdAndUpdate(
      disputeDetails._id,
      {
        $set: {
          dispute_status: "resolving",
          dispute_resolution_method:
            disputeDetails.dispute_resolution_method || "dispute_parties",
          resolution_description,
        },
      },
      { new: true, runValidators: true }
    ).populate("transaction user mediator");

    if (!updateDispute) {
      return next(errorHandler(500, "Failed to update transaction"));
    }

    // Use product_name from dispute instead of products array
    await Promise.all([
      sendSellerResolutionMailToBuyer(
        updateDispute.buyer_email,
        updateDispute.product_name
      ),
      sendSellerResolutionMailToSeller(
        updateDispute.vendor_email,
        updateDispute.product_name
      ),
    ]);

    res.json({
      status: "success",
      message:
        "Transaction form updated successfully and dispute is being resolved",
      data: {
        dispute: updateDispute,
      },
    });
  } catch (error: string | unknown) {
    console.log("error", error);
    return next(errorHandler(500, "Internal server error"));
  }
};
