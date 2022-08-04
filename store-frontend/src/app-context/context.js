import React, { } from 'react'

const ComposeProviders = function (props) {
  const { providers, children } = props;
  return (
    <>
      {providers.reduceRight((accumulator, Provider) => {
        return <Provider>{accumulator}</Provider>
      }, children)}
    </>
  );
}

export default ComposeProviders;