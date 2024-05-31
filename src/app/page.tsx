// 'use client'
import Link from "next/link";
import { canisterId, createActor } from "~/declarations/backend";
import { makeBackendActor } from "~/service/actor-locator";


const backend = makeBackendActor();

export  default async function HomePage() {
  type QueryResponse = {
    Ok: string
  };

  const query: QueryResponse = await backend.query_filter({ name: "karel" });

  const parsedQuery = JSON.parse(query.Ok) as  {
      name: string;
      id:number;
      age:number;
    }[];
 


  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-4 px-4 py-16 ">
       {parsedQuery.map((person) => (
         <div className="bg-slate-400 rounded-lg p-4">
         {person.name ?? 'No name'}
       </div>
       ))}
      </div>
    </main>
  );
}