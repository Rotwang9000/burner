
# Elastic Token Project

This project implements an "elastic supply" token that dynamically adjusts its total supply based on external price data. It uses on-chain price feeds and maintains separate reserves for each supported symbol (such as BTC or ETH). When a symbol’s price changes, the token can either mint or burn portions of the total supply to keep its valuation in line with those external references. Additionally, it features:

• A buy and sell mechanism with configurable taxes, enabling the contract owner to collect fees on transactions.  
• Long position functionality, allowing users to stake their ETH for leveraged exposure to a chosen symbol’s price movement.  
• Rebase logic to expand or contract the supply in response to each symbol’s price changes, ensuring the token remains closely tied to external markets.  
• Administrative actions, such as withdrawing collected taxes or deactivating symbols, restricted to the contract owner for safety and governance.  

By combining price feeds, rebase operations, and position management, the Elastic Token illustrates a flexible model for developing tokens that respond to real-world market movements.