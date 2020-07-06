<!-- This is a Vue.js single file component. -->
<!-- Check the Vue.js doc here :  -->
<!-- https://vuejs.org/v2/guide/ -->

<!-- This is your HTML -->
<template>
  <div class="section-container">
    <!-- wwManager:start -->
    <wwSectionEditMenu :sectionCtrl="sectionCtrl"></wwSectionEditMenu>
    <!-- wwManager:end -->

    <!-- This is the background of the section -->
    <wwObject
      class="background"
      :ww-object="section.data.background"
      ww-category="background"
    ></wwObject>

    <!--TOP WWOBJS-->
    <div class="top-ww-objs">
      <wwLayoutColumn
        tag="div"
        ww-default="ww-image"
        :ww-list="section.data.topWwObjs"
        class="top-ww-obj"
        @ww-add="add(section.data.topWwObjs, $event)"
        @ww-remove="remove(section.data.topWwObjs, $event)"
      >
        <wwObject
          v-for="topWwObj in section.data.topWwObjs"
          :key="topWwObj.uniqueId"
          :ww-object="topWwObj"
        ></wwObject>
      </wwLayoutColumn>
    </div>

    <div class="particles-container">
      <div class="particle overlayImage">
        <wwObject :ww-object="section.data.overlayImage"></wwObject>
      </div>
    </div>

    <div class="workflow-section-content">
      <ul class="workflow-list">
        <li
          class="workflow-wrapper"
          :class="{ selected: isWorkFlowSelected(workflow) }"
          v-for="(workflow, index) in section.data.workflows"
          :key="workflow.uniqueId"
        >
          <!-- wwManager:start -->
          <wwContextMenu
            ng-if="editMode"
            class="ww-orange-button"
            tag="div"
            :options="elemOptions"
            @remove="removeWorkflow(workflow)"
            @addBefore="addWorkflowBefore(index)"
            @addAfter="addWorkflowAfter(index)"
          >
            <wwOrangeButton></wwOrangeButton>
          </wwContextMenu>
          <!-- wwManager:end -->
          <div
            class="workflow-item"
            :class="{ selected: isWorkFlowSelected(workflow) }"
          >
            <div class="workflow-title">
              <wwObject tag="span" :ww-object="workflow.title"></wwObject>
            </div>
            <div class="workflow-content">
              <wwLayoutColumn
                tag="div"
                ww-default="ww-text"
                :ww-list="workflow.contentList"
                @ww-add="add(workflow.contentList, $event)"
                @ww-remove="remove(workflow.contentList, $event)"
              >
                <wwObject
                  tag="div"
                  ww-default="ww-text"
                  v-for="item in workflow.contentList"
                  :key="item.uniqueId"
                  :ww-object="item"
                ></wwObject>
              </wwLayoutColumn>
            </div>
          </div>
        </li>
      </ul>
      <ul class="navigator" ref="navigator">
        <div
          class="navigator-selector"
          ref="navigatorSelector"
          v-bind:style="navigatorStyle"
        ></div>
        <li
          v-for="(workflow, index) in section.data.workflows"
          :key="workflow.uniqueId"
        >
          <div class="navigator-item" @click="toggleWorkflow(workflow)">
            <wwObject
              tag="span"
              :ww-object="workflow.navigatorText"
              class="navigator-text"
              :class="{ selected: isWorkFlowSelected(workflow) }"
              ww-default="ww-text"
            ></wwObject>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<!-- This is your Javascript -->
<!-- ✨ Here comes the magic ✨ -->

<script>
import playAnimationTo from "./animation";

const wwo = window.wwLib.wwObject;
const wwu = window.wwLib.wwUtils;

export default {
  name: "__COMPONENT_NAME__",
  props: {
    sectionCtrl: Object,
  },
  data: () => ({
    nextParticlesPosition: "right",
    selectedWorkflow: {},
    elemOptions: {
      items: [
        {
          text: {
            en: "Before",
            fr: "Avant",
          },
          icon: "wwi wwi-add",
          action: "addBefore",
        },
        {
          text: {
            en: "After",
            fr: "Apres",
          },
          icon: "wwi wwi-add",
          action: "addAfter",
        },
        {
          text: {
            en: "Delete",
            fr: "Supprimer",
          },
          icon: "wwi wwi-delete",
          action: "remove",
        },
      ],
    },
    startingNavigatorPosition: 0,
  }),
  computed: {
    section() {
      return this.sectionCtrl.get();
    },

    editMode() {
      return this.sectionCtrl.getEditMode() === "CONTENT";
    },
    navigatorStyle() {
      const offset =
        this.startingNavigatorPosition +
        this.section.data.workflows.indexOf(this.selectedWorkflow) * 120;
      return {
        "margin-left": `${offset}px`,
      };
    },
  },
  created() {
    // Initialize the data once the section is created in the DOM
    this.init();
  },
  mounted() {
    if (this.section.data.workflows.length > 0) {
      this.selectedWorkflow = this.section.data.workflows[0];
      this.initNavigatorSelector();
    }
  },
  methods: {
    init() {
      // Initialize section data
      let needUpdate = false;

      // We will only save the data in this.section.data
      // So you need to put in there all the data of you WeWeb objects
      this.section.data = this.section.data || {};

      if (!this.section.data.background) {
        this.section.data.background = wwo.getDefault({
          type: "ww-color",
        });
        needUpdate = true;
      }

      if (_.isEmpty(this.section.data.topWwObjs)) {
        this.section.data.topWwObjs = [];
        needUpdate = true;
      }

      if (!this.section.data.overlayImage) {
        this.section.data.overlayImage = wwo.getDefault({
          type: "ww-image",
        });
        needUpdate = true;
      }

      if (!this.section.data.workflows) {
        this.section.data.workflows = [this.createWorkflow()];
        needUpdate = true;
      }
      needUpdate && this.update();
    },
    initNavigatorSelector() {
      const navigator = this.$refs.navigator;
      const firstNavigatorElement = navigator.getElementsByTagName("li")[0];
      this.startingNavigatorPosition = firstNavigatorElement.offsetLeft - 4;
    },
    getNewWorkflow: () => ({
      uniqueId: wwu.getUniqueId(),
      title: wwo.getDefault({ type: "ww-text" }),
      contentList: [],
      navigatorText: wwo.getDefault({ type: "ww-text" }),
    }),
    createWorkflow() {
      if (
        Array.isArray(this.section.data.workflows) &&
        this.section.data.workflows.length > 0
      ) {
        const workflow = JSON.parse(
          JSON.stringify(this.section.data.workflows[0])
        );
        wwu.changeUniqueIds(workflow);
        workflow.uniqueId = wwu.getUniqueId();
        return workflow;
      }
      return this.getNewWorkflow();
    },
    isWorkFlowSelected(workflow) {
      return workflow.uniqueId === this.selectedWorkflow.uniqueId;
    },
    toggleWorkflow(workflow) {
      this.selectedWorkflow = workflow;
      playAnimationTo(this.nextParticlesPosition);
      this.nextParticlesPosition =
        this.nextParticlesPosition === "right" ? "left" : "right";
    },

    addWorkflowBefore(index) {
      this.addWorkflowAt(index === 0 ? 0 : index - 1);
      this.update();
    },
    addWorkflowAfter(index) {
      this.addWorkflowAt(index + 1);
      this.update();
    },
    addWorkflowAt(index) {
      const { workflows } = this.section.data;
      const head = workflows.slice(0, index);
      const tail = index === 0 ? workflows : workflows.slice(index);
      this.section.data.workflows = [...head, this.createWorkflow(), ...tail];
    },
    removeWorkflow(workflow) {
      const { workflows } = this.section.data;
      if (workflows.length === 1) return;
      this.section.data.workflows = workflows.filter(
        (aWorkflow) => aWorkflow !== workflow
      );
      this.update();
    },
    update() {
      this.sectionCtrl.update(this.section);
    },

    // --------- EDITOR FUNCTIONS ---------
    // All the codes between /* wwManager:start */ and /* wwManager:end */ are only for editor purposes
    // So It won't in the published website!
    /* wwManager:start */
    add(list, options) {
      try {
        list.splice(options.index, 0, options.wwObject);
        this.sectionCtrl.update(this.section);
      } catch (error) {
        wwLib.wwLog.error("ERROR : ", error);
      }
    },
    remove(list, options) {
      try {
        list.splice(options.index, 1);
        this.sectionCtrl.update(this.section);
      } catch (error) {
        wwLib.wwLog.error("ERROR : ", error);
      }
    },
    /* wwManager:end */
  },
};
</script>

<!-- This is your CSS -->
<!-- Add "scoped" attribute to limit CSS to this component only -->
<!-- Add lang="scss" or others to use computed CSS -->
<style lang="scss" scoped>
.background {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
}

.top-ww-objs,
.bottom-ww-objs {
  position: relative;
  .top-ww-obj,
  .bottom-ww-obj {
    position: relative;
  }
}

.workflow-section-content {
  position: relative;
  padding: 100px 0 230px 0;
  width: 90%;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (min-width: 768px) {
    padding: 230px 0;
  }
}

.workflow {
  &-list {
    position: relative;
    width: 100%;
    padding: 0;
    min-height: 200px;
    list-style-type: none;
  }

  &-wrapper {
    position: absolute;
    top: 0;
    width: 100%;
    min-height: 200px;
    z-index: -1;

    &.selected {
      z-index: 1;
    }
  }

  &-item {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    opacity: 0;
    z-index: 0;

    &.selected {
      opacity: 1;
      transition: opacity 3000ms 500ms ease-out;
    }
  }

  &-title {
    font-style: normal;
    font-weight: bold;

    text-align: center;
    margin-bottom: 16px;

    @media (min-width: 768px) {
      font-size: 24px;
      line-height: 28px;
    }

    @media (min-width: 1024px) {
      font-size: 36px;
      line-height: 42px;
    }
  }

  &-icon {
    margin-bottom: 16px;
  }

  &-content {
    display: flex;
    flex-direction: column;
    justify-items: center;
  }
}

.navigator {
  --color-navigator-text: #444444;
  --color-navigator-text-selected: #000000;

  position: relative;
  display: flex;
  justify-content: center;
  flex-direction: row;
  align-items: center;
  width: 368px;
  height: 48px;
  margin-top: 64px;
  //   border-radius: 12px;
  padding: 4px;
  background-color: #ffffff;
  list-style-type: none;
  z-index: 3;

  &-item {
    cursor: pointer;
    pointer-events: all;
    width: 120px;
    overflow: hidden;
  }

  &-text {
    font-weight: bold;
    font-size: 24px;
    line-height: 28px;
    color: var(--color-navigator-text);

    &.selected {
      transition: color 500ms ease-in;
      color: var(--color-navigator-text-selected);
    }
  }

  &-selector {
    position: absolute;
    top: 4px;
    left: 4px;
    height: 40px;
    width: 120px;
    // border-radius: 12px;
    background-color: #efefef;
    transition: margin-left 250ms ease-in;
  }
}

.particles-container {
  position: absolute;
  top: 250px;
  left: 50%;
  width: 0;
  margin: auto;
}

.particle {
  display: block;
  position: absolute;
  width: 450px;

  @media (max-width: 1024px) {
    display: none;
  }

  &.overlayImage {
    top: 0;
    left: -450px;
    height: 270px;
    z-index: 10;
    @media (min-width: 1024px) {
      left: -625px;
    }
    @media (min-width: 1200px) {
      left: -625px;
    }
  }

  &.medium {
    top: 60px;
    left: -690px;
    z-index: 11;
  }

  &.small {
    top: 100px;
    left: -720px;
    z-index: 12;
  }
}
</style>
