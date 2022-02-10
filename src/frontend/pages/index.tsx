import type { NextPage } from 'next';
import { useState } from 'react';
import Head from 'next/head';
import MenuBar from '../components/MenuBar/notebookOptionsBar';
import NavBar from '../components/NavBar';
import SideBar from '../components/SideBar';
import Panel from "../components/Panel";
import NoteBookCell from '../components/Cell';
import { useSelector } from "react-redux";
import { AppState, NbCell } from '../lib/typings/types';

const Home: NextPage = () => {
  const [showPanel, setShowPanel] = useState<string | null>(null)
  const { cellIds, cells } = useSelector((state: { app: AppState }) => state.app)
  return (
    <div>
      <Head>
        <title>Dnotebook - Exciting Notebook experience</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex-row">
        <section>
          <NavBar />
        </section>
        {/* <section>
            <MenuBar />
        </section> */}
        <section
          className="overflow-hidden h-full"
          style={{
            marginTop: "69px",
            display: "flex",
            height: "90vh",
          }}
        >
          <div className="sticky flex-none h-full border-r-2">
            <SideBar setShowPanel={setShowPanel} showPanel={showPanel} />
          </div>
          {showPanel && (
            <div className="sticky flex-none h-full border-r-2 w-72">
              <Panel showPanel={showPanel} />
            </div>
          )}
          <div
            className="col-span-12 min-h-1/2 px-3.5 overflow-y-scroll"
            style={{
              width: "100%",
            }}
          >
            {cellIds.map((cellId: string, i: number) => {
              const cell: NbCell = cells[cellId];
              return (
                <div key={cellId}>
                  <NoteBookCell cell={cell} />
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home
