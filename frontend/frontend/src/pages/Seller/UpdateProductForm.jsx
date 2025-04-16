import React from "react";
import toast from 'react-hot-toast'
import axiosInstance from "../../lib/axios";
import { useState,useEffect } from "react";
const UpdateProductForm=({productId}) =>{
    const [categories,setCategories]=useState([])
    const [attributes,setAttributes]=useState([])
    const [selectedAttributes,setSelectedAttributes]=useState([])
    const [proudct,setProduct]=useState({
        name:"",
        description:"",
        category_name:"",
        stock_quantity:0,
        attributesValues:[],
        images:[],
        price:0

    });
    useEffect(()=>{
        const fetchProduct=async()=>{
            try{
               const respone= await axiosInstance.get(`/product/${productId}`);
        const productData = response.data;
        setProduct({
            name:productData.name,
            description:productData.description,
            category_id:productData.category_id,
            category_name:categories.find
        })

            }
        }
    })
}