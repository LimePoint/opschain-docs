---
sidebar_position: 5
description: Understand OpsChain's log forwarding capabilities and configure it to forward logs to external log storage solutions.
---

# Log forwarding

Understand how OpsChain's log aggregator works and, if required, configure it to forward build, change and workflow run logs to external log storage. After following this guide you should know how to:

- add plugins to the OpsChain log aggregator
- configure build, change and workflow run logs to be sent to external log storage
- build and use your own log aggregator image

## Introduction

OpsChain uses [Fluentd](https://www.fluentd.org/) as its log aggregator. Fluentd provides an extensive framework that allows for custom developed and [pre-built plugins](https://www.fluentd.org/dataoutputs) to be used to forward logs to external log storage solutions. This guide describes the capabilities of OpsChain's log aggregator and provides the steps on how to configure OpsChain to forward build, change and workflow run logs to a [Splunk HTTPS Event Collector](https://docs.splunk.com/Documentation/Splunk/8.2.1/Data/UsetheHTTPEventCollector).

## Capabilities

OpsChain's log aggregator is provided with a shared 1GB PVC for buffering logs, of which half (500MB) is reserved for buffering logs for OpsChain's internal logging infrastructure. The other half of the log aggregator's buffer is left for you to use for your additional outputs. Refer to Fluentd's [buffer configuration](https://docs.fluentd.org/configuration/buffer-section) guide on how to configure the buffer for your outputs.

:::tip PVC size
If you need to increase the PVC size, you can do so by modifying your `values.yaml` file and setting the `logAggregator.volume.size` value to the desired size and (re)deploying OpsChain.

```yaml
logAggregator:
  volume:
    size: 2Gi
```

:::

For example, to configure the buffer for the Splunk output plugin, dropping oldest chunks on an overflow and compressing the chunks using `zstd`, use a configuration similar to the example below:

```log
  <store>
    @type splunk_hec

    host splunk.myco.com
    port 8088
    token <Splunk HEC token>
    use_ssl false

    <buffer>
      @type file
      path /fluentd/buffer/my-company/splunk

      retry_forever true
      total_limit_size 100MB
      overflow_action drop_oldest_chunk
      compress zstd
    </buffer>
  </store>
```

:::info
It's up to you to ensure your configuration is valid. Please refer to Fluentd's [config file syntax](https://docs.fluentd.org/configuration/config-file) guide for more information.

You can check the log aggregator's logs for errors by running the following command:

```bash
kubectl logs -n ${KUBERNETES_NAMESPACE} deployment/opschain-log-aggregator -f
```

:::

### OpsChain's internal logging infrastructure

OpsChain's logging configuration sends logs to OpsChain's database and will buffer logs in the shared PVC, zstd compressed, until it is able to successfully flush them.

When there is a buffer overflow, OpsChain's internal behaviour is to drop the oldest logs.

## Configure additional outputs

OpsChain provides multiple options to configure additional outputs for Fluentd, choose the one that best suits your needs.

However you decide to configure the additional outputs, the configuration will be stored in a Kubernetes ConfigMap and mounted into the log-aggregator pod at runtime. You'll need to supply the entire `<store></store>` string of your configuration to this setting.

The configuration you provide to these settings will be read by Fluentd in the context of the [`copy` output plugin](https://docs.fluentd.org/output/copy) which OpsChain takes advantage of to send the OpsChain logs to multiple outputs.

Under the `copy` configuration, each `<store>` directive added instructs Fluentd to send the log entry to an additional target.

:::note
The specific configuration to include in `additionalOutputConfig` will depend on the plugin `@type` used. Please see Fluentd's [config file syntax](https://docs.fluentd.org/configuration/config-file) guide, and the relevant plugin manual for further information.
:::

### Via settings - post-installation

You can configure OpsChain settings pre-installation via Helm chart or post-installation via the UI configuration page.

#### Using the UI configuration page - post-installation

The simplest way to manage additional outputs is via OpsChain's UI configuration page. For example, to enable sending the logs to Splunk, just paste the entire `<store></store>` section into the setting and save.

```log
  <store>
    @type splunk_hec

    host splunk.myco.com
    port 8088
    token <Splunk HEC token>
    use_ssl false
  </store>
```

After the settings are applied, restart the log-aggregator deployment for the additional configuration to take effect.

```bash
kubectl rollout restart deployment opschain-log-aggregator -n ${KUBERNETES_NAMESPACE}
```

### Via Helm chart - pre-installation

The OpsChain Helm chart allows you to provide the additional configuration via the `logAggregator.additionalOutputConfig` value before installing OpsChain. An example configuration is provided below:

```yaml
logAggregator:
  additionalOutputConfig: |-
    <store>
      @type splunk_hec

      host splunk.myco.com
      port 8088
      token <Splunk HEC token>
      use_ssl false
    </store>

```

:::note
When this method is used, the configuration will not appear in OpsChain's UI configuration page. You can check the ConfigMap to verify the configuration that is being applied.

```bash
kubectl get configmap opschain-log-aggregator-additional-output-config -n ${KUBERNETES_NAMESPACE} -o jsonpath='{.data.output\.conf}'
```

:::

## Build your own log aggregator image

If you need more flexibility than the options provided by the UI configuration page or the Helm chart, you can build your own log aggregator image based on the existing `limepoint/opschain-log-aggregator` image.

Most Fluentd output plugins can be installed by using the `fluent-gem install` command. For example, to install the Splunk output plugin your Dockerfile might look like this:

```Dockerfile
ARG OPSCHAIN_VERSION
FROM limepoint/opschain-log-aggregator:${OPSCHAIN_VERSION}

RUN fluent-gem install fluent-plugin-splunk-enterprise
```

You may also use the custom Dockerfile to include your company's private CA certificate if the output plugin you are using requires it to verify the TLS connection to your logging infrastructure.

```Dockerfile
ARG OPSCHAIN_VERSION
FROM limepoint/opschain-log-aggregator:${OPSCHAIN_VERSION}

RUN fluent-gem install fluent-plugin-splunk-enterprise

# add your company's private CA certificate
COPY myco-cacert.pem /etc/ssl/myco-cacert.pem
```

Once you have added the required customisations to the Dockerfile, build and push the image to your private image registry. An example is provided below:

```shell
OPSCHAIN_VERSION='2022-04-11' # EXAMPLE ONLY - To find the current version for your OpsChain instance, you can run the `opschain info` CLI command
docker build --build-arg OPSCHAIN_VERSION --tag "image-registry.myco.com/myco/opschain-log-aggregator:${OPSCHAIN_VERSION}-1" .
docker push "image-registry.myco.com/myco/opschain-log-aggregator:${OPSCHAIN_VERSION}-1"
# builds and pushes an image tagged as image-registry.myco.com/myco/opschain-log-aggregator:2022-04-11-1
```

### Configure OpsChain to use your custom log aggregator image

Once you have built and pushed your custom log aggregator image to your private registry, you can tell OpsChain to use it by overriding the `logAggregator.image` value in the OpsChain Helm chart.

```yaml
logAggregator:
  image: image-registry.myco.com/myco/opschain-log-aggregator:2022-04-11-1
```

If your internal registry requires credentials to pull this image, update the OpsChain [imagePullSecret](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/) config to allow this image to be pulled. For example:

```bash
kubectl edit -n ${KUBERNETES_NAMESPACE} secret opschain-image-secret
```

:::danger
Modify the base64 encoded `.dockerconfigjson` value to add the additional credentials. Don't remove the existing ones.
:::

Once you have configured OpsChain to use your image, you can use the files you added in your additional outputs configuration:

```bash
  <store>
    @type splunk_hec

    hec_host splunk.myco.com
    hec_port 8088
    hec_token <Splunk HEC token>
    use_ssl true
    ssl_verify false
    # Using the custom CA certificate
    ca_file /etc/ssl/myco-cacert.pem
  </store>
```
