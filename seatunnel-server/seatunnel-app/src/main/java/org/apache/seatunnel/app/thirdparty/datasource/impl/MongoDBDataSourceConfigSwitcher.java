package org.apache.seatunnel.app.thirdparty.datasource.impl;

import org.apache.seatunnel.shade.com.typesafe.config.Config;
import org.apache.seatunnel.shade.com.typesafe.config.ConfigValueFactory;

import org.apache.seatunnel.api.configuration.Option;
import org.apache.seatunnel.api.configuration.util.OptionRule;
import org.apache.seatunnel.api.configuration.util.RequiredOption;
import org.apache.seatunnel.app.domain.request.connector.BusinessMode;
import org.apache.seatunnel.app.domain.request.job.DataSourceOption;
import org.apache.seatunnel.app.domain.request.job.SelectTableFields;
import org.apache.seatunnel.app.domain.response.datasource.VirtualTableDetailRes;
import org.apache.seatunnel.app.dynamicforms.FormStructure;
import org.apache.seatunnel.app.thirdparty.datasource.AbstractDataSourceConfigSwitcher;
import org.apache.seatunnel.app.thirdparty.datasource.DataSourceConfigSwitcher;
import org.apache.seatunnel.common.constants.PluginType;

import com.google.auto.service.AutoService;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@AutoService(DataSourceConfigSwitcher.class)
@Slf4j
public class MongoDBDataSourceConfigSwitcher extends AbstractDataSourceConfigSwitcher {
    private static final String DATABASE = "database";
    private static final String COLLECTION = "collection";
    private static final String SCHEMA = "schema";

    @Override
    public String getDataSourceName() {
        return "MONGODB";
    }

    @Override
    public FormStructure filterOptionRule(
            String connectorName,
            OptionRule dataSourceOptionRule,
            OptionRule virtualTableOptionRule,
            BusinessMode businessMode,
            PluginType pluginType,
            OptionRule connectorOptionRule,
            List<RequiredOption> addRequiredOptions,
            List<Option<?>> addOptionalOptions,
            List<String> excludedKeys) {
        excludedKeys.add(SCHEMA);
        return super.filterOptionRule(
                connectorName,
                dataSourceOptionRule,
                virtualTableOptionRule,
                businessMode,
                pluginType,
                connectorOptionRule,
                addRequiredOptions,
                addOptionalOptions,
                excludedKeys);
    }

    @Override
    public Config mergeDatasourceConfig(
            Config dataSourceInstanceConfig,
            VirtualTableDetailRes virtualTableDetail,
            DataSourceOption dataSourceOption,
            SelectTableFields selectTableFields,
            BusinessMode businessMode,
            PluginType pluginType,
            Config connectorConfig) {
        // Use field to generate the schema
        connectorConfig =
                connectorConfig.withValue(
                        DATABASE,
                        ConfigValueFactory.fromAnyRef(
                                virtualTableDetail.getDatasourceProperties().get(DATABASE)));
        connectorConfig =
                connectorConfig.withValue(
                        COLLECTION,
                        ConfigValueFactory.fromAnyRef(
                                virtualTableDetail.getDatasourceProperties().get(COLLECTION)));
        if (pluginType == PluginType.SOURCE) {
            connectorConfig =
                    connectorConfig.withValue(
                            SCHEMA,
                            KafkaKingbaseDataSourceConfigSwitcher.SchemaGenerator
                                    .generateSchemaBySelectTableFields(
                                            virtualTableDetail, selectTableFields)
                                    .root());
        }

        return super.mergeDatasourceConfig(
                dataSourceInstanceConfig,
                virtualTableDetail,
                dataSourceOption,
                selectTableFields,
                businessMode,
                pluginType,
                connectorConfig);
    }
}
