import React from 'react';
import { PropsAD, PropsContext } from './interface'

const ComposeProviders: React.FunctionComponent<PropsContext> = function (props: PropsContext) {
  const { providers, children } = props;
  return (
    <>
      {providers.reduceRight((accumulator: React.ReactNode, Provider: (props: PropsAD) => JSX.Element) => {
        console.log(typeof Provider) // is a function (props: PropsAD) => JSX.Element
        // Provider: (props: PropsAD) => JSX.Element
        // accumulator is nested tree of components so falls under React.ReactNode
        return <Provider>{accumulator}</Provider>
      }, children)}
    </>
  );
}

export default ComposeProviders;