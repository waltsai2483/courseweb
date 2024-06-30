'use server';
	
import {cityBuses, intercityBuses} from "@/const/bus";
import {headers} from "next/headers";

export type BusesSchedules = {
    time: string;
    description: string;
    route: "校園公車";
    dep_stop: string;
    line: string;
} | {
    time: string;
    description: string;
    route: "南大區間車";
}

export type CityBusTime = {
    line: string,
    dest_zh: string,
    dest_en: string,
    direction: "1" | "2";
    time: string;
}

export const getBusesSchedules = async (bus_type: 'all'|'main'|'nanda', day: 'all'|'weekday'|'weekend'|'current', direction: 'up' | 'down') => {
    const res = await fetch(`https://api.nthusa.tw/buses/schedules/?bus_type=${bus_type}&day=${day}&direction=${direction}`);
    
    // If res fails, fallback to json file
    if (!res.ok) {
        console.log('Failed to fetch bus schedules, fallback to local json file');
        const data = await fetch(`https://nthumods.com/fallback_data/bus/${bus_type}_${day}_${direction}.json`);
        return await data.json() as BusesSchedules[];
    }

    const data = await res.json();
    return data as BusesSchedules[];
}

export const getNTHUCityBusTime = async (type: 'city'|'intercity', route: string, direction: '1' | '2') => {
    const res = await fetch(`https://www.taiwanbus.tw/eBUSPage/Query/ws/getRData.ashx?type=4&key=${route}${direction}`, {
        headers: {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "content-type": "text/html; charset=utf-8"
        },
        referrer: "https://www.taiwanbus.tw/",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: null,
        method: "GET",
        cache: "no-cache"
    });
    if (!res.ok) {
        console.log('Failed to fetch bus schedules from taiwanbus');
        return null;
    }

    const busData: {data: any[]} = await res.json();
    let busTime = "";
    if (type == "city") {
        busTime = busData.data.find(time => ["37571", "37304", "39607"].includes(time.cid))?.ptime;
        if (busTime == null) {
            busTime = busData.data.find(time => ["37402"].includes(time.cid)).ptime; // 2支A其中一個方向清大無停靠，以光復中學站代替
        }
    } else {
        busTime = busData.data.find(time => ["35445", "35233", "39340", "37132", "39522" ].includes(time.cid))?.ptime ?? "";
    }
    return { line: route, direction: direction, time: busTime, dest_zh: busData.data[busData.data.length-1].na, dest_en: busData.data[busData.data.length-1].ena } as CityBusTime;
}

export const getCityBusesTime = async () => {
    return Promise.all(cityBuses.map((cityBus) => cityBus.direction.map((direction) => getNTHUCityBusTime("city", cityBus.id, direction))).flat());
}

export const getIntercityBusesTime = async () => {
    return Promise.all(intercityBuses.map((cityBus) => [getNTHUCityBusTime("intercity", cityBus.id, '1'), getNTHUCityBusTime("intercity", cityBus.id, '2')]).flat());
}
  
// export type GetStopBusAPIResponse = {
//     bus_info: {
//         time: string;
//         description: string;
//         route: string;
//     };
//     arrive_time: string;
// }[]

// export const getStopBus = async (stop_name: string, bus_type: 'all'|'main'|'nanda', day: 'all'|'weekday'|'weekend'|'current', direction: 'up' | 'down') => {
//     const res = await fetch(`https://api.nthusa.tw/buses/stops/${stop_name}?bus_type=${bus_type}&day=${day}&direction=${direction}`);
//     const data = await res.json();
//     return data as GetStopBusAPIResponse;
// }