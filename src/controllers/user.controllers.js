import { asyncHandler } from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import { User} from '../models/user.models.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';




const registerUser = asyncHandler(async (req,res) => {
    //get user from frontend 
    //get details like fullname password etc
    //validation not empty
    //check if user already exist: email,username
    //check for images ,check for avatar
    //upload them on cloudinary,avatar check 
    // ucreate user object - create entry in db
    // remove password and refresh token field from response
    //check for user creation
    //return user or else give error res


    const {fullName,email,username,password} = req.body
    console.log("email :",email);
    if (
        [fullName,email,username,password].some((field) =>
        field?.trim() === ""
        )
    ) {
        throw new ApiError(400,"All fields are required")
    }

     const existedUser = User.findOne({

         $or: [{username },{ email}]
    })
     if (existedUser) {
          throw new ApiError(409, "User with email or username already exist")
            
    }
     const avatarLocalPath = req.files?.avatar[0]?.path;
     const coverImageLocalPath = req.files?.coverImage[0]?.path;

     if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is required")
     }

       const avatar = await uploadOnCloudinary(avatarLocalPath)
       const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if (!avatar) {
            throw new ApiError (400, "Avatar file is required")
        }


         const user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })

          const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"

          )

          if(!createdUser) {
            throw new ApiError(500, "Someting went wrong while registering user")
          }

          return res.status(201).json(
            new ApiResponse(200, createdUser, "User Registered succesfully")
          )
 



 })



 

export {
    registerUser,

}