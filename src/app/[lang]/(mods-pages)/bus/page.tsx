'use client';
import {cityBuses, intercityBuses} from "@/const/bus";

;
import { useSettings } from "@/hooks/contexts/settings";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import { FC, SVGProps, useEffect, useMemo, useState } from "react";
import useTime from "@/hooks/useTime";
import { useQuery } from "@tanstack/react-query";
import {
    CityBusTime,
    getBusesSchedules,
    getCityBusesTime,
    getIntercityBusesTime,
    getNTHUCityBusTime
} from "./page.actions";
import { addMinutes, differenceInMinutes, format, isWeekend, set } from "date-fns";
import { cn } from "@/lib/utils";
import { ChevronRight, Timer } from "lucide-react";
import { RedLineIcon } from "@/components/BusIcons/RedLineIcon";
import { GreenLineIcon } from "@/components/BusIcons/GreenLineIcon";
import { NandaLineIcon } from "@/components/BusIcons/NandaLineIcon";
import { useRouter, useSearchParams } from "next/navigation";
import { getTimeOnDate } from "@/helpers/bus";
import useDictionary from '@/dictionaries/useDictionary';
import {CityBusIcon} from "@/components/BusIcons/CityBusIcon";
import {IntercityBusIcon} from "@/components/BusIcons/IntercityBusIcon";

type BusListingItemProps = { typeTab: string, destTab: string, startTime: string, refTime: Date, Icon: FC<SVGProps<SVGSVGElement>>, line: string, direction: string, title: string, destination?: string, notes?: string[], arrival: string }
const BusListingItem = ({ typeTab, destTab, startTime, refTime, Icon, line, title, destination, direction, notes = [], arrival }: BusListingItemProps) => {
    const { language } = useSettings();
    const dict = useDictionary();

    const displayTime = useMemo(() => {
        // check if is time, else return as is
        if (!arrival.match(/\d{2}:\d{2}/)) return arrival;
        const time_arr = set(new Date(), { hours: parseInt(arrival.split(":")[0]), minutes: parseInt(arrival.split(":")[1]) });
        // if now - time < 1 minutes, display "即將發車"
        if (time_arr.getTime() < refTime.getTime()) {
            return dict.bus.departed;
        }
        else if (time_arr.getTime() - refTime.getTime() < 2 * 60 * 1000) {
            return dict.bus.departing;
        }
        // within 5 minutes, display relative time
        else if (time_arr.getTime() - refTime.getTime() < 5 * 60 * 1000) {
            return `${differenceInMinutes(time_arr, refTime)} min`
        }
        return arrival;
    }, [arrival, refTime, dict]);

    const router = useRouter();
    const typeurl = typeTab == 'school_bus' ? "school_bus" : "city_bus";
    const route = line == 'nanda' ? 'nanda' : 'main';

    // index should start at 0 if is green/up and red/up, but when is down , green/down should start at 5 and red/down at 4
    // if is nanda, both dir index should start at 0
    const index = direction == 'up' ? 0 : line == 'green' ? 5 : line == 'red' ? 4 : 0;

    const handleItemClick = () => {
        router.push(`/${language}/bus/${typeurl}/${route}/${line == 'nanda' ? `${line}_${direction}`: line }?return_url=/${language}/bus?type=${typeTab}%26dest=${destTab}`);
    }

    return  <div className={cn("flex flex-col gap-4 py-4", arrival == dict.bus.service_over ? 'opacity-30': '')}> 
        <div className={cn("flex flex-row items-center gap-4 cursor-pointer")} onClick={handleItemClick}>
            <Icon className="h-7 w-7" />
            <div className="flex flex-row flex-wrap gap-2">
                <h3 className="text-slate-800 dark:text-neutral-100 font-bold">
                    <span>{title}</span>
                    {destination && <span>-{destination}</span>}
                </h3>
            </div>
            <div className={cn("flex-1 text-right text-slate-800 dark:text-neutral-200 font-bold whitespace-nowrap", displayTime == dict.bus.departing ? 'text-nthu-500': '')}>{displayTime}</div>
            <div className="grid place-items-center">
                <ChevronRight className="w-4 h-4"/>
            </div>
        </div>
        <div className="flex flex-row gap-2">
            <div className="justify-center items-center gap-2 inline-flex cursor-pointer" onClick={() => router.push(`/${language}/bus/${typeurl}/${route}`)}>
                <Timer className="w-4 h-4"/>
                <div className="text-center text-sm font-medium">{"發車時刻表"}</div>
            </div>
            {notes.map(note => <div className="justify-center items-center gap-2 inline-flex" key={note}>
                <div className="text-center text-sm font-medium">・{note}</div>
            </div>)}
        </div>
    </div>
}



const BusPage = () => {
    const { language } = useSettings();
    const time = useTime();
    const dict = useDictionary();
    const searchParams = useSearchParams();
    const [busTypeTab, setBusTypeTab] = useState('school_bus');
    const [destTab, setDestTab] = useState('north_gate');
    const router = useRouter();

    useEffect(() => {
        if (searchParams.has('type')) {
            setBusTypeTab(searchParams.get('type') as string);
        }
        if (searchParams.has('dest')) {
            setDestTab(searchParams.get('dest') as string);
        }
    }, [searchParams]);

    const weektype = isWeekend(time) ? 'weekend' : 'weekday';

    const { data: UphillBuses = [], error } = useQuery({
        queryKey: ['buses_up', weektype],
        queryFn: () => getBusesSchedules('all', weektype, 'up'),
    });

    const { data: DownhillBuses = [], error: error2 } = useQuery({
        queryKey: ['buses_down', weektype],
        queryFn: () => getBusesSchedules('all', weektype, 'down'),
    });

    const { data: CityBuses = [], error: error3 } = useQuery({
        queryKey: ['city_buses'],
        queryFn: () => getCityBusesTime(),
    });

    const { data: IntercityBuses = [], error: error4 } = useQuery({
        queryKey: ['intercity_buses'],
        queryFn: () => getIntercityBusesTime(),
    });


    const getSchoolBuses = () => {
        const returnData: (Omit<BusListingItemProps, 'refTime'> & {
            line: 'red' | 'green' | 'nanda' | 'tld';
        })[] = [];
        if (destTab === 'north_gate') {
            for (const bus of UphillBuses.filter(bus => differenceInMinutes(getTimeOnDate(time, bus.time).getTime(),time.getTime()) >= 0)) {
                if (bus.route === '校園公車') {
                    const notes = [];
                    if (bus.description) notes.push(bus.description);
                    if (bus.dep_stop === "綜二 ") notes.push(language == 'zh' ? "綜二發車": 'Dep. from GEN II');
                    if (bus.line === 'red') {
                        if(returnData.some((bus) => bus.line === 'red')) continue;
                        returnData.push({
                            typeTab: 'school_bus',
                            destTab: 'north_gate',
                            Icon: RedLineIcon,
                            startTime: bus.time,
                            line: 'red',
                            direction: 'up',
                            title: dict.bus.red_line,
                            notes,
                            arrival: bus.time,
                        });
                    } else if (bus.line === 'green') {
                        if(returnData.some((bus) => bus.line === 'green')) continue;
                        returnData.push({
                            typeTab: 'school_bus',
                            destTab: 'north_gate',
                            Icon: GreenLineIcon,
                            startTime: bus.time,
                            line: 'green',
                            direction: 'up',
                            title: dict.bus.green_line,
                            notes,
                            arrival: bus.time,
                        });
                    }
                } else if (bus.route === '南大區間車') {
                    if(returnData.some((bus) => bus.line === 'nanda')) continue;
                    if(bus.description == "週五停駛" && time.getDay() === 5) continue;
                    const notes = [];
                    if(bus.description.includes("83號")) notes.push(language == 'zh' ? "83號": "Bus 83");
                    returnData.push({
                        typeTab: 'school_bus',
                        destTab: 'north_gate',
                        Icon: NandaLineIcon,
                        startTime: bus.time,
                        line: 'nanda',
                        direction: 'up',
                        title: dict.bus.nanda_line,
                        destination: language == 'zh' ? '往南大校區' : 'To Nanda',
                        notes,
                        arrival: bus.time,
                    });
                }
            }
        } else if (destTab === 'tsmc') {
            // SCHOOL BUS DOWNHILL FROM TSMC
            for (const bus of DownhillBuses.filter(bus => getTimeOnDate(time, bus.time).getTime() > time.getTime())) {
                if (bus.route === '校園公車') {
                    const notes = [];
                    if (bus.description) notes.push(bus.description);
                    if (bus.dep_stop === "綜二 ") notes.push(language == 'zh' ? "綜二發車": 'Dep. from GEN II');
                    if (bus.line === 'red') {
                        if(returnData.some((bus) => bus.line === 'red')) continue;
                        returnData.push({
                            typeTab: 'school_bus',
                            destTab: 'tsmc',
                            Icon: RedLineIcon,
                            startTime: bus.time,
                            line: 'red',
                            direction: 'down',
                            title: dict.bus.red_line,
                            notes,
                            arrival: bus.time,
                        });
                    } else if (bus.line === 'green') {
                        if(returnData.some((bus) => bus.line === 'green')) continue;
                        returnData.push({
                            typeTab: 'school_bus',
                            destTab: 'tsmc',
                            Icon: GreenLineIcon,
                            startTime: bus.time,
                            line: 'green',
                            direction: 'down',
                            title: dict.bus.green_line,
                            notes,
                            arrival: bus.time,
                        });
                    }
                }
            }
            // NANDA BUS UPHILL TO NANDA (filter busses that left 7 minutes ago, and new time is arrive time + 7 minutes)
            for (const bus of UphillBuses.filter(bus => bus.route === '南大區間車').filter(bus => addMinutes(getTimeOnDate(time, bus.time).getTime(), 7).getTime() > time.getTime())) {
                if (bus.route === '南大區間車') {
                    if(returnData.some((bus) => bus.line === 'nanda')) continue;
                    if(bus.description == "週五停駛" && time.getDay() === 5) continue;
                    const notes = [];
                    if(bus.description.includes("83號")) notes.push(language == 'zh' ? "83號": "Bus 83");
                    returnData.push({
                        typeTab: 'school_bus',
                        destTab: 'tsmc',
                        Icon: NandaLineIcon,
                        startTime: bus.time,
                        line: 'nanda',
                        direction: 'up',
                        title: dict.bus.nanda_line,
                        destination: language == 'zh' ? '往南大校區' : 'To Nanda',
                        notes,
                        arrival: format(addMinutes(getTimeOnDate(time, bus.time).getTime(), 7), 'H:mm'),
                    });
                }
            }

            //sort by time
            returnData.sort((a, b) => {
                return getTimeOnDate(time, a.arrival).getTime() - getTimeOnDate(time, b.arrival).getTime();
            });
        } else if (destTab === 'nanda') {
            for (const bus of DownhillBuses.filter(bus => getTimeOnDate(time, bus.time).getTime() > time.getTime())) {
                if (bus.route !== '南大區間車') continue;
                if(returnData.some((bus) => bus.line === 'nanda')) continue;
                if(bus.description == "週五停駛" && time.getDay() === 5) continue;
                const notes = [];
                if(bus.description.includes("83號")) notes.push(language == 'zh' ? "83號": "Bus 83");
                returnData.push({
                    typeTab: 'school_bus',
                    destTab: 'nanda',
                    Icon: NandaLineIcon,
                    startTime: bus.time,
                    line: 'nanda',
                    direction: 'down',
                    title: dict.bus.nanda_line,
                    destination: language == 'zh' ? '往校本部' : 'To Main Campus',
                    notes,
                    arrival: bus.time,
                });
            }
        }

        // filler for no service buses
        if(!returnData.some((bus) => bus.line === 'red') && destTab != 'nanda') {
            returnData.push({
                typeTab: 'school_bus',
                destTab: 'north_gate',
                Icon: RedLineIcon,
                startTime: '0:00',
                line: 'red',
                direction: 'up',
                title: dict.bus.red_line,
                arrival: dict.bus.service_over,
            });
        }
        if(!returnData.some((bus) => bus.line === 'green') && destTab != 'nanda') {
            returnData.push({
                typeTab: 'school_bus',
                destTab: 'north_gate',
                Icon: GreenLineIcon,
                startTime: '0:00',
                line: 'green',
                direction: 'up',
                title: dict.bus.green_line,
                arrival: dict.bus.service_over,
            });
        }
        if(!returnData.some((bus) => bus.line === 'nanda')) {
            returnData.push({
                typeTab: 'school_bus',
                destTab: 'north_gate',
                Icon: NandaLineIcon,
                startTime: '0:00',
                line: 'nanda',
                direction: 'up',
                title: dict.bus.nanda_line,
                arrival: dict.bus.service_over,
            });
        }

        return returnData
    }

    const getCityBuses = () => {
        const returnData: Omit<BusListingItemProps, 'refTime'>[] = []
        const busMap = new Map(CityBuses.filter((bus) => bus).map((bus) => [`${bus!.line}${bus!.direction}`, bus as CityBusTime]));
        for (const bus of cityBuses) {
            for (const direction of bus.direction) {
                const busData = busMap.get(`${bus.id}${direction}`);
                if (!busData) {
                    returnData.push({
                        typeTab: 'city_bus',
                        destTab: 'nthu',
                        Icon: CityBusIcon,
                        startTime: '0:00',
                        line: 'nanda',
                        direction: 'up',
                        title: `${language == 'zh' ? bus.title_zh : bus.title_en}`,
                        arrival: dict.bus.error,
                    });
                    continue;
                }
                returnData.push({
                    typeTab: 'city_bus',
                    destTab: 'nthu',
                    Icon: CityBusIcon,
                    startTime: '0:00',
                    line: 'nanda',
                    direction: 'up',
                    title: `${language == 'zh' ? bus.title_zh : bus.title_en} - ${dict.bus.to} ${language == 'zh' ? busData.dest_zh : busData.dest_en}`,
                    arrival: busData.time ?? "?",
                });
            }
        }
        return returnData;
    }

    const getIntercityBuses = () => {
        const returnData: Omit<BusListingItemProps, 'refTime'>[] = []
        const busMap = new Map(IntercityBuses.filter((bus) => bus).map((bus) => [`${bus!.line}${bus!.direction}`, bus as CityBusTime]));
        for (const bus of intercityBuses) {
            const direction = destTab == "from_nthu" ? 1 : 2;
                const busData = busMap.get(`${bus.id}${direction}`);
                if (!busData) {
                    returnData.push({
                        typeTab: 'city_bus',
                        destTab: 'nthu',
                        Icon: IntercityBusIcon,
                        startTime: '0:00',
                        line: 'nanda',
                        direction: 'up',
                        title: `${language == 'zh' ? bus.title_zh : bus.title_en}`,
                        arrival: dict.bus.error,
                    });
                    continue;
                }
                returnData.push({
                    typeTab: 'city_bus',
                    destTab: 'nthu',
                    Icon: IntercityBusIcon,
                    startTime: '0:00',
                    line: 'nanda',
                    direction: 'up',
                    title: `${language == 'zh' ? bus.title_zh : bus.title_en} - ${dict.bus.to} ${language == 'zh' ? busData.dest_zh : busData.dest_en}`,
                    arrival: busData.time ?? "?",
                });

        }
        return returnData;
    }

    const displayBuses = useMemo(() => {
        if (busTypeTab == "school_bus") {
            return getSchoolBuses();
        } else if (busTypeTab == "city_bus") {
            return getCityBuses();
        } else if (busTypeTab == "intercity_bus") {
            return getIntercityBuses();
        }
    }, [busTypeTab, destTab, UphillBuses, DownhillBuses, CityBuses]);

    const handleTypeTabChange = (tab: string) => {
        setBusTypeTab(tab);
        let dest: string
        if (tab == "school_bus") {
            dest = "north_gate";
        } else if (tab == "city_bus") {
            dest = "nthu";
        } else {
            dest = "from_nthu";
        }
        setDestTab(dest);
        router.replace(`?type=${tab}&dest=${dest}`)
    }

    const handleDestTabChange = (tab: string) => {
        setDestTab(tab);
        router.replace(`?type=${busTypeTab}&dest=${tab}`)
    }

    return <div className="flex flex-col px-4">
        <Tabs defaultValue="school_bus" value={busTypeTab} onValueChange={handleTypeTabChange}>
            <TabsList className="w-full justify-evenly mb-2">
                <TabsTrigger className="flex-1" value="school_bus">{dict.bus.school_bus}</TabsTrigger>
                <TabsTrigger className="flex-1" value="city_bus">{dict.bus.city_bus}</TabsTrigger>
                <TabsTrigger className="flex-1" value="intercity_bus">{dict.bus.intercity_bus}</TabsTrigger>
            </TabsList>
            <TabsContent value="school_bus">
                <Tabs defaultValue="north_gate" value={destTab} onValueChange={handleDestTabChange}>
                    <TabsList className="w-full justify-evenly mb-4">
                        <TabsTrigger className="flex-1" value="north_gate">{dict.bus.north_gate}</TabsTrigger>
                        <TabsTrigger className="flex-1" value="tsmc">{dict.bus.tsmc}</TabsTrigger>
                        <TabsTrigger className="flex-1" value="nanda">{dict.bus.nanda}</TabsTrigger>
                    </TabsList>
                </Tabs>
            </TabsContent>
            <TabsContent value="city_bus">
                <Tabs defaultValue="nthu" value={destTab} onValueChange={handleDestTabChange}>
                    <TabsList className="w-full justify-evenly mb-4">
                        <TabsTrigger className="flex-1" value="nthu">{dict.bus.nthu}</TabsTrigger>
                    </TabsList>
                </Tabs>
            </TabsContent>
            <TabsContent value="intercity_bus">
                <Tabs defaultValue="from_nthu" value={destTab} onValueChange={handleDestTabChange}>
                    <TabsList className="w-full justify-evenly mb-4">
                        <TabsTrigger className="flex-1" value="from_nthu">{dict.bus.from_nthu}</TabsTrigger>
                        <TabsTrigger className="flex-1" value="to_nthu">{dict.bus.to_nthu}</TabsTrigger>
                    </TabsList>
                </Tabs>
            </TabsContent>
            <div className="flex flex-col px-2 divide-y divide-slate-100 dark:divide-neutral-700">
                {displayBuses?.map((bus, index) => (
                    <BusListingItem key={index} {...bus} refTime={time} />
                ))}
            </div>
        </Tabs>
    </div>
}

export default BusPage;