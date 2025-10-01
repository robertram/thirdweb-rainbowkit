import { useEffect, useState } from 'react';
import { GetStaticPropsContext } from 'next';
import { deployPublishedContract } from "thirdweb/deploys";
import { defineChain } from "thirdweb";
import { TransactionButton } from "thirdweb/react";
import { deployERC20Contract } from "thirdweb/deploys";
import { client } from '@/app/client';

export const DeployContract = () => {

  const deployContract = async () => {
    // const chain = defineChain(84532);

    // console.log('account', account);

    // const contractAddress = await deployERC20Contract({
    //   chain,
    //   client,
    //   account,
    //   type: "TokenERC20",
    //   params: {
    //     name: "MyToken",
    //     description: "My Token contract",
    //     symbol: "MT",
    //   }
    // });

    // console.log('contractAddress', contractAddress);

    ////--------------------------------

    // const address = await deployPublishedContract({
    //   client: thirdwebClient,
    //   chain,
    //   account,
    //   contractId: "TokenERC20",
    //   contractParams: {
    //     name: "MyToken",
    //     symbol: "MTK",
    //     primary_sale_recipient: "0xcF240E52cC09caD5C66b0eb7327E9C0a159D55F2",
    //     platform_fee_recipient: "0xcF240E52cC09caD5C66b0eb7327E9C0a159D55F2",
    //     platform_fee_bps: 500, // 5%
    //   },
    //   publisher: '0xcF240E52cC09caD5C66b0eb7327E9C0a159D55F2'                        //account.address, // optional, defaults to the thirdweb deployer
    // });

    // console.log('address', address);
  }

  return (
      <div className="">
        <div className='max-w-large flex items-center m-auto'>
          Deploy contract!!

          <button onClick={deployContract} className="bg-blue-500 text-black px-4 py-2 rounded-md">Deploy contract</button>

          {/* <TransactionButton
            transaction={() => {
              return claimTo({
                contract,
                quantity: 1n,
                to: wagmiAccount.address!,
                tokenId: 0n,
              });
            }}
            onError={(e) => console.error(e)}
          >
            Mint
          </TransactionButton>

          <TransactionButton
            transaction={async () => {
              const chain = defineChain(137);
              return await deployPublishedContract({
                client: thirdwebClient,
                chain,
                account,
                contractId: "DropERC721",
                contractParams: {
                  name: "MyToken",
                  symbol: "MTK",
                  primary_sale_recipient: "0xcF240E52cC09caD5C66b0eb7327E9C0a159D55F2",
                  platform_fee_recipient: "0xcF240E52cC09caD5C66b0eb7327E9C0a159D55F2",
                  platform_fee_bps: 500, // 5%
                },
                publisher: '0xcF240E52cC09caD5C66b0eb7327E9C0a159D55F2'//account.address, // optional, defaults to the thirdweb deployer
              });
            }}
            onError={(e) => console.error(e)}
          >
            Dpeloy contract
          </TransactionButton> */}

        </div>
      </div>
  )
}
