/**
 * @swagger
 * /quote:
 *   post:
 *     summary: Get a swap quote for token pair
 *     description: Returns the best swap route and expected output amount for a token swap on the default chain (0G)
 *     tags: [Swap]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SwapQuoteRequest'
 *     responses:
 *       200:
 *         description: Swap quote successfully generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SwapQuoteResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /{chain}/quote:
 *   post:
 *     summary: Get a swap quote for token pair on specific chain
 *     description: Returns the best swap route and expected output amount for a token swap on the specified chain
 *     tags: [Swap]
 *     parameters:
 *       - $ref: '#/components/parameters/ChainParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SwapQuoteRequest'
 *     responses:
 *       200:
 *         description: Swap quote successfully generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SwapQuoteResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /testnet/quote:
 *   post:
 *     summary: Get a swap quote on testnet
 *     description: Returns the best swap route and expected output amount for a token swap on the testnet
 *     tags: [Swap]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SwapQuoteRequest'
 *     responses:
 *       200:
 *         description: Swap quote successfully generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SwapQuoteResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /swap:
 *   post:
 *     summary: Create a swap transaction
 *     description: Generates transaction data for executing a swap based on a quote on the default chain (0G)
 *     tags: [Swap]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SwapTransactionRequest'
 *     responses:
 *       200:
 *         description: Swap transaction successfully generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SwapTransactionResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /{chain}/swap:
 *   post:
 *     summary: Create a swap transaction on specific chain
 *     description: Generates transaction data for executing a swap based on a quote on the specified chain
 *     tags: [Swap]
 *     parameters:
 *       - $ref: '#/components/parameters/ChainParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SwapTransactionRequest'
 *     responses:
 *       200:
 *         description: Swap transaction successfully generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SwapTransactionResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /testnet/swap:
 *   post:
 *     summary: Create a swap transaction on testnet
 *     description: Generates transaction data for executing a swap based on a quote on the testnet
 *     tags: [Swap]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SwapTransactionRequest'
 *     responses:
 *       200:
 *         description: Swap transaction successfully generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SwapTransactionResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /tokenDetails/{tokenAddress}:
 *   get:
 *     summary: Get token details
 *     description: Returns detailed information about a token on the default chain (0G)
 *     tags: [Token]
 *     parameters:
 *       - $ref: '#/components/parameters/TokenAddressParam'
 *     responses:
 *       200:
 *         description: Token details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenDetails'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /{chain}/tokenDetails/{tokenAddress}:
 *   get:
 *     summary: Get token details on specific chain
 *     description: Returns detailed information about a token on the specified chain
 *     tags: [Token]
 *     parameters:
 *       - $ref: '#/components/parameters/ChainParam'
 *       - $ref: '#/components/parameters/TokenAddressParam'
 *     responses:
 *       200:
 *         description: Token details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenDetails'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /tokenPrice/{tokenAddress}:
 *   get:
 *     summary: Get token price
 *     description: Returns the current price of a token on the default chain (0G)
 *     tags: [Token]
 *     parameters:
 *       - $ref: '#/components/parameters/TokenAddressParam'
 *     responses:
 *       200:
 *         description: Token price retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenPrice'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /{chain}/tokenPrice/{tokenAddress}:
 *   get:
 *     summary: Get token price on specific chain
 *     description: Returns the current price of a token on the specified chain
 *     tags: [Token]
 *     parameters:
 *       - $ref: '#/components/parameters/ChainParam'
 *       - $ref: '#/components/parameters/TokenAddressParam'
 *     responses:
 *       200:
 *         description: Token price retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenPrice'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /tokenList:
 *   get:
 *     summary: Get list of token addresses
 *     description: Returns an array of all available token addresses on the default chain (0G)
 *     tags: [Token]
 *     responses:
 *       200:
 *         description: Token list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenList'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /{chain}/tokenList:
 *   get:
 *     summary: Get list of token addresses on specific chain
 *     description: Returns an array of all available token addresses on the specified chain
 *     tags: [Token]
 *     parameters:
 *       - $ref: '#/components/parameters/ChainParam'
 *     responses:
 *       200:
 *         description: Token list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenList'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /tokenListWithDetails:
 *   get:
 *     summary: Get list of tokens with details
 *     description: Returns an array of all available tokens with their metadata on the default chain (0G)
 *     tags: [Token]
 *     responses:
 *       200:
 *         description: Token list with details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenListWithDetails'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /{chain}/tokenListWithDetails:
 *   get:
 *     summary: Get list of tokens with details on specific chain
 *     description: Returns an array of all available tokens with their metadata on the specified chain
 *     tags: [Token]
 *     parameters:
 *       - $ref: '#/components/parameters/ChainParam'
 *     responses:
 *       200:
 *         description: Token list with details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenListWithDetails'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
