import { channel } from "diagnostics_channel";
import { type } from "os";
import React, {
  Ref,
  RefObject,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useEventListener, useScreen, useWindowSize } from "usehooks-ts";

export type Channel = {
  uuid: string;
  title: string;
  logo: string;
  type?: string;
  country?: string;
  provider?: string;
  year?: number;
};

type Rating = {
  Source: string;
  Value: string;
};
export type Epg = {
  id: string;
  description: string;
  title: string;
  isYesterday: true;
  since: string;
  till: string;
  channelUuid: string;
  image: string;
  country: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Language: string;
  Country: string;
  Awards: string;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  totalSeasons: string;
  Response: string;
  Ratings: Rating[];
  rating: number;
};

type EpgByChannel = { [key: string]: Epg[] };

type TimelineProps = {
  data: {
    channels: Channel[];
    epg: Epg[];
  };
};

const rowHeight = 80;
const hourWidth = 300;
const timeLineSplit = 4;
const timeFormat: 24 | 12 = 12;

type ChartProps = {
  epgByChannel: EpgByChannel;
  startDate: number;
};

const Chart = memo(function Chart({ epgByChannel, startDate }: ChartProps) {
  return (
    <>
      {Object.values(epgByChannel).map((channelEpg, i) => {
        return (
          <div className="flex relative" style={{ top: i * rowHeight }}>
            {channelEpg.map((epg) => {
              const since = new Date(epg.since).getTime();
              const till = new Date(epg.till).getTime();
              const offset = ((since - startDate) / 1000 / 60 / 60) * hourWidth;
              const length = ((till - since) / 1000 / 60 / 60) * hourWidth;
              if (length > 1000) return null;

              return (
                <div
                  className={`absolute p-1`}
                  style={{ left: offset, width: length, height: rowHeight }}
                >
                  <div className=" bg-[#04293A] h-full rounded-md">
                    {epg.title}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
});

function Timeline({ data: { channels, epg } }: TimelineProps) {
  const { width } = useWindowSize();
  const chartRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const channelsRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState<number>(0);
  const [scrollLeft, setScrolLeft] = useState<number>(0);

  const [startDate, setStartDate] = useState<number>(0);
  const epgByChannel: EpgByChannel = useMemo(() => {
    if (!channels || !epg) return {};

    const temp: EpgByChannel = {};

    epg.forEach((epg: Epg) => {
      if (temp[epg.channelUuid]) temp[epg.channelUuid].push(epg);
      else temp[epg.channelUuid] = [epg];
    });

    return temp;
  }, [channels, epg]);

  useEffect(() => {
    if (!chartRef.current || !timeRef.current || !channelsRef.current) return;
    chartRef.current.scrollLeft = scrollLeft;
    chartRef.current.scrollTop = scrollTop;
    timeRef.current.scrollLeft = scrollLeft;
    channelsRef.current.scrollTop = scrollTop;
  }, [scrollTop, scrollLeft]);

  const scrollHandler = ({
    scrollTop,
    scrollLeft,
  }: {
    scrollTop?: number;
    scrollLeft?: number;
  }) => {
    scrollTop && setScrollTop(scrollTop);
    scrollLeft && setScrolLeft(scrollLeft);
  };

  useEventListener(
    "scroll",
    () =>
      chartRef.current &&
      scrollHandler({
        scrollTop: chartRef.current.scrollTop,
        scrollLeft: chartRef.current.scrollLeft,
      }),
    chartRef
  );

  useEventListener(
    "scroll",
    () =>
      channelsRef.current &&
      scrollHandler({
        scrollTop: channelsRef.current.scrollTop,
      }),
    channelsRef
  );

  useEventListener(
    "scroll",
    () =>
      timeRef.current &&
      scrollHandler({
        scrollLeft: timeRef.current.scrollLeft,
      }),
    timeRef
  );

  useEffect(() => {
    if (!chartRef.current) return;
    console.log(chartRef.current.scrollLeft);
    console.log(chartRef.current.scrollTop);
  }, [chartRef.current]);

  useEffect(() => {
    const d = new Date(Date.now());
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    setStartDate(d.getTime());
  }, []);

  //todo skeleton
  return (
    <div className="bg-[#041C32] grid grid-cols-12 grid-rows-[auto] h-[500px] rounded-[10px] overflow-hidden">
      <div></div>
      <div
        ref={timeRef}
        className=" col-start-2 col-end-13 row-start-1 row-end-2 scrollbar-none overflow-scroll pt-8"
      >
        <div className=" flex flex-row w-fit">
          {[...Array(24).keys()].map((i) => {
            const hour = timeFormat === 24 ? i : i > 12 ? i - 12 : i;
            const formattedHour = `${hour < 10 ? 0 : ""}${hour}:00${
              timeFormat === 12 && i > 12 ? "pm" : "am"
            }`;
            return (
              <div
                className="flex justify-start flex-col"
                style={{ width: hourWidth }}
              >
                <p className="text-[#ECB365] w-fit">{formattedHour}</p>
                <div className="flex w-full h-[10px]">
                  {[...Array(timeLineSplit).keys()].map(() => (
                    <div
                      className="border-l-solid border-l-2 border-l-[#ECB365]"
                      style={{ width: hourWidth / timeLineSplit }}
                    ></div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div
        ref={channelsRef}
        className=" col-start-1 col-end-2 row-start-2 row-end-auto scrollbar-none overflow-scroll pb-2"
      >
        <div className=" flex flex-col h-fit"></div>
        {Object.keys(epgByChannel)?.map((uuid) => {
          const channel = channels.find((channel) => channel.uuid === uuid);
          return (
            <div
              className="flex align-middle justify-center p-5"
              style={{ height: rowHeight }}
            >
              <img src={channel?.logo} alt="" />
            </div>
          );
        })}
      </div>
      <div
        ref={chartRef}
        className=" col-start-2 col-end-13 row-start-2 row-end-auto scrollbar-none overflow-scroll flex"
      >
        <Chart epgByChannel={epgByChannel} startDate={startDate} />
      </div>
    </div>
  );
}

export default Timeline;
