const models = require('../models');

const { Op } = require('sequelize');
exports.analyticsCountCustomerHandler = async function (req, res) {
  try {
    const fetchTotalCustomer = await models.Customer_table.findAll();
    const totalCustomer = fetchTotalCustomer.length;

    const fetchTotalProduct = await models.Product.findAll();
    const totalProduct = fetchTotalProduct.length;


    res.status(200).json({
      success: true,
      totalCustomer,
      totalProduct,
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching analytics data.",
    });
  }
};






exports.generateChartDataHandler = async function (req, res) {
  try {
    const { start_date, end_date } = req.body;

    const query = `
      SELECT 
        YEAR(createdAt) AS Year,
        SUM(price) AS total_price
      FROM shopify.Orders
      WHERE createdAt BETWEEN ? AND ?
      GROUP BY YEAR(createdAt)
      ORDER BY YEAR ASC;
    `;

    
    const result = await models.sequelize.query(query, {
      replacements: [start_date, end_date], 
      type: models.Sequelize.QueryTypes.SELECT,
    });

        const formattedResult = result.reduce((acc, { Year, total_price }) => {
      acc[Year] = total_price.toFixed(0); 
      return acc;
    }, {});

    // console.log("formattedResult", formattedResult);

    
    res.status(200).json({
      success: true,
      data: formattedResult, 
    });
  } catch (error) {
    console.error("Error generating chart data:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while generating chart data",
    });
  }
};
