import React from "react"

export interface PropsAD {
    children?: React.ReactNode
}

export interface PropsContext extends PropsAD {
    // like an array of AlertProvider and DashboardProvider
    providers: Array<(props: PropsAD) => JSX.Element>
    // children?: React.ReactNode
}

export interface Dispatch {
    type: string
    payload: any
}