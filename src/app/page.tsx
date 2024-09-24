"use client"
import React, { use, useEffect, useMemo, useState } from 'react'
import { NftPlatform } from "~/components/nft-platform";

export default function Home() {

  return (

      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] ">
        <>
        <NftPlatform />
        </>

      </main>
  );
}
