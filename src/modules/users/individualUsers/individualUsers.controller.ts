import { Request, Response } from "express";
import IndividualUser from "../../authentication/individualUserAuth/individualUserAuth.model";
import OrganizationModel from "../../authentication/organizationUserAuth/organizationAuth.model";

/** GET: http://localhost:5000/users/user/:user_id */
export const getIndividualUser = async (req: Request, res: Response) => {
  // console.log(res.locals.user);

  return res.status(200).json({
    status: true,
    message: "Logged in user profile",
    data: res.locals.user,
  });
};

/** GET: http://localhost:5000/users */
// export const getAllIndividualUsers = async (req: Request, res: Response) => {};
//  * @param: {
//  * "id": "<userid>"
//  * }
//  *
//  * body: {
//  * "email": "kor@gmail.com",
//  * "phonenum": "1232455",
//  * "username": "jane doe",
//  * "fullname": "Ada Jones"
//  * }
//  */

/** PUT: http://localhost:5000/users/updateuser
 * @param: {
 * "id": "<userid>"
 * }
 *
 * body: {
 * "email": "kor@gmail.com",
 * "phonenum": "1232455",
 * "username": "jane doe",
 * "fullname": "Ada Jones"
 * }
 */
export const updateIndividualUser = async (req: Request, res: Response) => {
  const { userData } = res.locals.user;

  const { phone_number, name, contact_email, contact_number } = req.body;

  if (userData.role === "ind") {
    const updatedUser = await IndividualUser.findOneAndUpdate(
      { email: userData.email },
      { name, phone_number }
    );

    return res.status(200).json({
      message: "Individual user sucessfully updated",
      updatedUser,
    });
  } else if (userData.role === "org") {
    const updatedUser = await OrganizationModel.findOneAndUpdate(
      { organization_email: userData.organization_email },
      { contact_email, contact_number },
      { new: true }
    );

    return res.status(200).json({
      message: "Organization user sucessfully updated",
      updatedUser,
    });
  }
};

/** DELETE: http://localhost:5000/users/deleteuser */
// export const deleteIndividualUser = async (req: Request, res: Response) => {};
