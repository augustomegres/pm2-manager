import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/chip";
import { Play, RefreshCw, Square } from "react-feather";
import { Input } from "@nextui-org/input";

import DefaultLayout from "@/layouts/default";
import { SearchIcon } from "@/components/icons";

type Data = {
  id: number;
  app: string;
  group: string;
  status: string;
  statusId: number;
  monit: {
    cpu: number;
    memory: number;
  };
};

export default function IndexPage() {
  const [data, setData] = useState<Data[]>([]);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const fetchData = () => {
      fetch("http://localhost:9999/api/processes")
        .then((response) => response.json())
        .then((data) => {
          const formattedData = data.map((item: any) => {
            let statusId = 0;

            if (item.pm2_env.status === "online") statusId = 0;
            if (item.pm2_env.status === "errored") statusId = 1;
            if (item.pm2_env.status === "stopped") statusId = 2;

            return {
              id: item.pm_id,
              app: item.pm2_env.name,
              group: item.pm2_env.namespace,
              status: item.pm2_env.status,
              monit: item.monit,
              statusId: statusId,
            };
          });

          // Ordenar os dados antes de definir o estado
          const sortedData = formattedData.sort(customSort);

          setData(sortedData);
        })
        .catch((error) => console.error("Error fetching data:", error));
    };

    fetchData(); // Fetch initial data

    const intervalId = setInterval(fetchData, 1000); // Fetch data every second

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  const handleStop = (id: number) => {
    fetch(`http://localhost:9999/api/processes/${id}/stop`, {
      method: "POST",
    })
      .then((response) => response.json())
      .then(() => {
        setData((prevData) =>
          prevData.map((item) =>
            item.id === id ? { ...item, status: "stopped", statusId: 2 } : item,
          ),
        );
      })
      .catch((error) => console.error("Error stopping process:", error));
  };

  const handleRestart = (id: number) => {
    fetch(`http://localhost:9999/api/processes/${id}/restart`, {
      method: "POST",
    })
      .then((response) => response.json())
      .then(() => {
        setData((prevData) =>
          prevData.map((item) =>
            item.id === id ? { ...item, status: "online", statusId: 0 } : item,
          ),
        );
      })
      .catch((error) => console.error("Error restarting process:", error));
  };

  const handleStart = (id: number) => {
    fetch(`http://localhost:9999/api/processes/${id}/start`, {
      method: "POST",
    })
      .then((response) => response.json())
      .then(() => {
        setData((prevData) =>
          prevData.map((item) =>
            item.id === id ? { ...item, status: "online", statusId: 0 } : item,
          ),
        );
      })
      .catch((error) => console.error("Error starting process:", error));
  };

  const handleRestartOnlineApps = () => {
    data.map((item) => {
      if (item.status === "online") {
        handleRestart(item.id);
      }
    });
  };

  const stopAll = () => {
    data.map((item) => {
      handleStop(item.id);
    });
  };

  function customSort(a: any, b: any) {
    if (a.statusId < b.statusId) {
      return -1;
    }
    if (a.statusId > b.statusId) {
      return 1;
    }

    return 0;
  }

  const dataSorted: Data[] = data.sort(customSort);

  return (
    <DefaultLayout>
      <div className="flex justify-between">
        <Input
          isClearable
          className="mb-4 w-1/3"
          placeholder="Pesquisar..."
          size="sm"
          startContent={<SearchIcon />}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
        />
        <div className="flex gap-2">
          <Button color="warning" size="sm" onClick={handleRestartOnlineApps}>
            <RefreshCw size={16} /> Restart
          </Button>
          <Button color="danger" size="sm" onClick={stopAll}>
            <Square size={16} /> Stop
          </Button>
        </div>
      </div>
      <Table aria-label="Example static collection table">
        <TableHeader>
          <TableColumn>App</TableColumn>
          <TableColumn>Group</TableColumn>
          <TableColumn>Cpu</TableColumn>
          <TableColumn>Memory</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn className="text-center" width={100}>
            Actions
          </TableColumn>
        </TableHeader>
        <TableBody>
          {dataSorted
            .filter((data) =>
              data?.app?.toLowerCase().includes(search.toLowerCase()),
            )
            .map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.app}</TableCell>
                <TableCell>{item.group}</TableCell>
                <TableCell>{item.monit?.cpu}%</TableCell>
                <TableCell>
                  {(item.monit?.memory / 1000000).toFixed(2)} MB
                </TableCell>
                <TableCell>
                  {item.status === "online" && (
                    <Chip color="success" size="sm" variant="dot">
                      Online
                    </Chip>
                  )}
                  {item.status === "stopped" && (
                    <Chip color="default" size="sm" variant="dot">
                      Parado
                    </Chip>
                  )}
                  {item.status === "errored" && (
                    <Chip color="danger" size="sm" variant="dot">
                      Erro
                    </Chip>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    {item.status === "stopped" ? (
                      <Button
                        isIconOnly
                        color="success"
                        size="sm"
                        variant="flat"
                        onClick={() => handleStart(item.id)}
                      >
                        <Play size={16} />
                      </Button>
                    ) : (
                      <>
                        <Button
                          isIconOnly
                          className="mr-2"
                          color="warning"
                          size="sm"
                          variant="flat"
                          onClick={() => handleRestart(item.id)}
                        >
                          <RefreshCw size={16} />
                        </Button>
                        <Button
                          isIconOnly
                          className="mr-2"
                          color="danger"
                          size="sm"
                          variant="flat"
                          onClick={() => handleStop(item.id)}
                        >
                          <Square size={16} />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </DefaultLayout>
  );
}
